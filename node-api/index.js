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

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query to find the user in the database by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

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
