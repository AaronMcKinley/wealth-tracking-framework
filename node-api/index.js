require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/authenticateToken');

const app = express();
const pool = new Pool();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

const handleError = (res, msg = 'Internal server error', code = 500) => {
  console.error(msg);
  return res.status(code).json({ message: msg });
};

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return handleError(res, 'Invalid credentials', 400);

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return handleError(res, 'Invalid credentials', 400);

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error('Login error:', err.stack || err);
    handleError(res);
  }
});

app.get('/api/investments', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    console.log('Fetching investments for user ID:', userId);

    const query = `
      SELECT
        i.id, i.user_id, i.asset_name, i.asset_ticker, i.type,
        i.total_quantity, i.average_buy_price,
        COALESCE(m.current_price, 0) AS current_price,
        COALESCE(m.percent_change_24h, 0) AS percent_change_24h,
        (COALESCE(m.current_price, 0) * i.total_quantity) AS current_value,
        ((COALESCE(m.current_price, 0) - i.average_buy_price) * i.total_quantity) AS profit_loss,
        i.created_at
      FROM investments i
      LEFT JOIN (
        SELECT ticker, current_price, price_change_percentage_24h AS percent_change_24h FROM cryptocurrencies
        UNION ALL
        SELECT ticker, current_price, previous_close AS percent_change_24h FROM stocks_and_funds
      ) m ON i.asset_ticker = m.ticker
      WHERE i.user_id = $1
      ORDER BY i.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    console.log('Investments fetched:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching investments:', err.stack || err);
    handleError(res, 'Failed to fetch investments');
  }
});

app.get('/api/transactions/:ticker', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { ticker } = req.params;

    const query = `
      SELECT id, transaction_type, quantity, price_per_unit, total_value, fees, transaction_date
      FROM transactions
      WHERE user_id = $1 AND LOWER(asset_ticker) = LOWER($2)
      ORDER BY transaction_date DESC
    `;

    const result = await pool.query(query, [userId, ticker]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching transactions:', err.stack || err);
    handleError(res, 'Failed to fetch transactions');
  }
});

app.post('/api/investments', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { name, type, amount, buy_price } = req.body;

    if (!name || !type || !amount || !buy_price) {
      return handleError(res, 'Missing required fields', 400);
    }

    let assetResult;
    const lowerType = type.toLowerCase();

    if (lowerType === 'crypto') {
      assetResult = await pool.query(
        `SELECT name, ticker FROM cryptocurrencies WHERE LOWER(name) = LOWER($1) OR LOWER(ticker) = LOWER($1) LIMIT 1`,
        [name]
      );
    } else if (['stock', 'etf', 'bond', 'reit', 'commodity'].includes(lowerType)) {
      assetResult = await pool.query(
        `SELECT name, ticker FROM stocks_and_funds WHERE (LOWER(name) = LOWER($1) OR LOWER(ticker) = LOWER($1)) AND type = $2 LIMIT 1`,
        [name, lowerType]
      );
    } else {
      return handleError(res, `Unsupported type: ${type}`, 400);
    }

    if (assetResult.rows.length === 0) {
      return handleError(res, `Asset '${name}' not found`, 404);
    }

    const asset = assetResult.rows[0];
    const total_value = Number(amount) * Number(buy_price);

    await pool.query(
      `INSERT INTO transactions (user_id, asset_ticker, transaction_type, quantity, price_per_unit, total_value, fees, transaction_date)
       VALUES ($1, $2, 'buy', $3, $4, $5, 0, NOW())`,
      [user_id, asset.ticker, amount, buy_price, total_value]
    );

    const agg = await pool.query(
      `SELECT
         SUM(quantity) AS total_quantity,
         SUM(quantity * price_per_unit) / NULLIF(SUM(quantity), 0) AS average_price
       FROM transactions
       WHERE user_id = $1 AND asset_ticker = $2 AND transaction_type = 'buy'`,
      [user_id, asset.ticker]
    );

    const total_quantity = parseFloat(agg.rows[0].total_quantity) || 0;
    const average_price = parseFloat(agg.rows[0].average_price) || 0;

    const update = await pool.query(
      `UPDATE investments SET total_quantity = $1, average_buy_price = $2
       WHERE user_id = $3 AND asset_ticker = $4 RETURNING *`,
      [total_quantity, average_price, user_id, asset.ticker]
    );

    if (update.rowCount === 0) {
      await pool.query(
        `INSERT INTO investments
         (user_id, asset_name, asset_ticker, type, total_quantity, average_buy_price, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [user_id, asset.name, asset.ticker, type, total_quantity, average_price]
      );
    }

    res.status(201).json({ message: 'Investment and transaction recorded' });
  } catch (err) {
    console.error('Error adding investment:', err.stack || err);
    handleError(res, err.message || 'Failed to add investment');
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack || err);
  handleError(res);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
