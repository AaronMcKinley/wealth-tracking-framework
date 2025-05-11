const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs'); // For password hashing and comparison

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection setup (uses environment variables by default)
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

// Login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query to find the user in the database by username
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    // If user is not found, return error message
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Compare the hashed password in the database with the entered password
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords do not match, return error message
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If login is successful, return success message
    res.json({ message: 'Login successful', user });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
