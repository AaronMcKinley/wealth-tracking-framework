require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool();

const addTransaction = async (
  pool,
  {
    user_id,
    asset_name,
    asset_ticker,
    type,
    quantity,
    price_per_unit,
    transaction_type = 'buy',
    fees = 0,
    transaction_date = new Date(),
  }
) => {
  if (!user_id || !asset_ticker || !type || !quantity || !price_per_unit || !transaction_type) {
    throw new Error('Missing required fields');
  }

  const total_value = Number(quantity) * Number(price_per_unit);

  const insertTx = await pool.query(
    `INSERT INTO transactions
      (user_id, asset_ticker, transaction_type, quantity, price_per_unit, total_value, fees, transaction_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [user_id, asset_ticker, transaction_type, quantity, price_per_unit, total_value, fees, transaction_date]
  );

  const aggResult = await pool.query(
    `SELECT
      COALESCE(SUM(CASE WHEN transaction_type = 'buy' THEN quantity ELSE -quantity END), 0) AS total_quantity,
      CASE WHEN SUM(CASE WHEN transaction_type = 'buy' THEN quantity ELSE 0 END) = 0 THEN 0 ELSE
        SUM(CASE WHEN transaction_type = 'buy' THEN quantity * price_per_unit ELSE 0 END) /
        SUM(CASE WHEN transaction_type = 'buy' THEN quantity ELSE 0 END)
      END AS average_buy_price
     FROM transactions
     WHERE user_id = $1 AND asset_ticker = $2`,
    [user_id, asset_ticker]
  );

  const { total_quantity, average_buy_price } = aggResult.rows[0];

  if (total_quantity <= 0) {
    await pool.query(
      `DELETE FROM investments WHERE user_id = $1 AND asset_ticker = $2`,
      [user_id, asset_ticker]
    );
  } else {
    await pool.query(
      `INSERT INTO investments
        (user_id, asset_ticker, asset_name, type, total_quantity, average_buy_price, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id, asset_ticker)
       DO UPDATE SET
         total_quantity = EXCLUDED.total_quantity,
         average_buy_price = EXCLUDED.average_buy_price,
         updated_at = NOW()`,
      [user_id, asset_ticker, asset_name, type, total_quantity, average_buy_price]
    );
  }

  return insertTx.rows[0];
};

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful', user });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/investments', async (req, res) => {
  try {
    // TODO: Replace 1 with authenticated user ID
    const userId = 1;

    const query = `
      SELECT
        i.id,
        i.user_id,
        i.asset_name,
        i.asset_ticker,
        i.type,
        i.total_quantity,
        i.average_buy_price,
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
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching investments:', err.message);
    res.status(500).json({ message: 'Failed to fetch investments' });
  }
});

app.post('/api/investments', async (req, res) => {
  try {
    const { user_id, name, type, amount, buy_price } = req.body;

    if (!user_id || !name || !type || !amount || !buy_price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let assetResult;

    switch (type.toLowerCase()) {
      case 'crypto':
        assetResult = await pool.query(
          `SELECT name, ticker FROM cryptocurrencies WHERE LOWER(name) = LOWER($1) OR LOWER(ticker) = LOWER($1) LIMIT 1`,
          [name]
        );
        break;
      case 'stock':
      case 'etf':
      case 'bond':
      case 'reit':
      case 'commodity':
        assetResult = await pool.query(
          `SELECT name, ticker FROM stocks_and_funds WHERE (LOWER(name) = LOWER($1) OR LOWER(ticker) = LOWER($1)) AND type = $2 LIMIT 1`,
          [name, type.toLowerCase()]
        );
        break;
      default:
        return res.status(400).json({ message: `Unsupported type: ${type}` });
    }

    if (assetResult.rows.length === 0) {
      return res.status(404).json({ message: `Asset '${name}' not found` });
    }

    const asset = assetResult.rows[0];

    const transaction = await addTransaction(pool, {
      user_id,
      asset_name: asset.name,
      asset_ticker: asset.ticker,
      type: type.toLowerCase(),
      quantity: Number(amount),
      price_per_unit: Number(buy_price),
      transaction_type: 'buy',
    });

    res.status(201).json({ message: 'Transaction added', transaction });
  } catch (err) {
    console.error('Error adding transaction:', err);
    res.status(500).json({ message: err.message || 'Failed to add transaction' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
