require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool(); // uses env vars for DB

// Login route
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
    const result = await pool.query('SELECT * FROM investments');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching investments:', err.message);
    res.status(500).json({ message: 'Failed to fetch investments' });
  }
});

const addInvestment = async (pool, { user_id, name, amount, buy_price, type }) => {
  if (!user_id || !name || !amount || !buy_price || !type) {
    throw new Error('Missing required fields');
  }

  const normalizedType = type.toLowerCase();

  let assetResult;

  switch (normalizedType) {
    case 'crypto':
      assetResult = await pool.query(
        `SELECT name, ticker, current_price, price_change_percentage_24h
         FROM cryptocurrencies
         WHERE LOWER(name) = LOWER($1) OR LOWER(ticker) = LOWER($1)
         LIMIT 1`,
        [name]
      );
      break;

    case 'stock':
    case 'etf':
    case 'bond':
    case 'reit':
    case 'commodity':
      assetResult = await pool.query(
        `SELECT name, ticker, current_price, previous_close AS price_change_percentage_24h
         FROM stocks_and_funds
         WHERE (LOWER(name) = LOWER($1) OR LOWER(ticker) = LOWER($1))
           AND type = $2
         LIMIT 1`,
        [name, normalizedType]
      );
      break;

    default:
      throw new Error(`Unsupported investment type '${type}'`);
  }

  if (assetResult.rows.length === 0) {
    throw new Error(`Asset '${name}' not found for type '${type}'`);
  }

  const asset = assetResult.rows[0];
  const current_price = Number(asset.current_price);
  const amountNum = Number(amount);
  const buyPriceNum = Number(buy_price);
  const priceChangePct24h = Number(asset.price_change_percentage_24h) || 0;

  const current_value = current_price * amountNum;
  const profit_loss = (current_price - buyPriceNum) * amountNum;

  console.log('Inserting investment:', {
    user_id,
    name: asset.name,
    ticker: asset.ticker,
    type: normalizedType,
    amount: amountNum,
    buy_price: buyPriceNum,
    current_value,
    profit_loss,
    percent_change_24h: priceChangePct24h,
  });

  const insertResult = await pool.query(
    `INSERT INTO investments (
      user_id, name, ticker, type, amount, buy_price,
      current_value, profit_loss, percent_change_24h
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id`,
    [
      user_id,
      asset.name,
      asset.ticker,
      normalizedType,
      amountNum,
      buyPriceNum,
      current_value,
      profit_loss,
      priceChangePct24h,
    ]
  );

  return insertResult.rows[0];
};

app.post('/api/investments', async (req, res) => {
  try {
    const investment = await addInvestment(pool, req.body);
    res.status(201).json({ message: 'Investment added', id: investment.id });
  } catch (err) {
    console.error('Add investment error:', err.message || err);
    res.status(400).json({ message: err.message || 'Failed to add investment' });
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
