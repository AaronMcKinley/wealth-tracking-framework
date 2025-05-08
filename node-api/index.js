const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection setup (lazy usage in route)
const pool = new Pool(); // uses environment variables by default

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Wealth Tracking API!');
});

// Health check route
app.get('/api/status', (req, res) => {
  res.json({ status: 'API is running' });
});

// Simple test route
app.get('/api/test', (req, res) => {
  res.send('API test route is working!');
});

// PostgreSQL connection test route
app.get('/api/db-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ dbTime: result.rows[0].now });
  } catch (err) {
    console.error('PostgreSQL connection failed:', err.message);
    res.status(500).json({ error: 'Database not reachable' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
