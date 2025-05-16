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

// Get all investments route
app.get('/api/investments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM investments');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching investments:', err.message);
    res.status(500).json({ message: 'Failed to fetch investments' });
  }
});

// addInvestment function to insert a new investment with autofill from cryptocurrencies table
const addInvestment = async (pool, { user_id, name, amount, buy_price }) => {
  if (!user_id || !name || !amount || !buy_price) {
    throw new Error('Missing required fields');
  }

  // Lookup crypto info by name (case-insensitive)
  const cryptoResult = await pool.query(
    `SELECT name, ticker, current_price, price_change_percentage_24h
     FROM cryptocurrencies
     WHERE LOWER(name) = LOWER($1)`,
    [name]
  );

  if (cryptoResult.rows.length === 0) {
    throw new Error(`Cryptocurrency name '${name}' not found`);
  }

  const crypto = cryptoResult.rows[0];

  // Convert to numbers explicitly
  const current_price = Number(crypto.current_price);
  const amountNum = Number(amount);
  const buyPriceNum = Number(buy_price);
  const priceChangePct24h = Number(crypto.price_change_percentage_24h) || 0;

  const current_value = current_price * amountNum;
  const profit_loss = (current_price - buyPriceNum) * amountNum;

  console.log('Inserting investment:', {
    user_id,
    name: crypto.name,
    ticker: crypto.ticker,
    amount: amountNum,
    buy_price: buyPriceNum,
    current_value,
    profit_loss,
    percent_change_24h: priceChangePct24h,
  });

  // Insert investment
  const insertResult = await pool.query(
    `INSERT INTO investments (
      user_id, name, ticker, type, amount, buy_price,
      current_value, profit_loss, percent_change_24h
    ) VALUES ($1, $2, $3, 'crypto', $4, $5, $6, $7, $8)
    RETURNING id`,
    [
      user_id,
      crypto.name,
      crypto.ticker,
      amountNum,
      buyPriceNum,
      current_value,
      profit_loss,
      priceChangePct24h,
    ]
  );

  return insertResult.rows[0];
};

// POST route to add investment
app.post('/api/investments', async (req, res) => {
  try {
    const investment = await addInvestment(pool, req.body);
    res.status(201).json({ message: 'Investment added', id: investment.id });
  } catch (err) {
    console.error('Add investment error:', err.message);
    res.status(400).json({ message: err.message || 'Failed to add investment' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
