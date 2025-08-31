// Load env vars from project root (.env)
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

process.env.TZ = 'Europe/Dublin';

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const apiRoutes = require('./routes');

const app = express();
const pool = new Pool();

// Startup guard: require JWT secret before serving requests
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// API health check: quick OK without touching DB
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Backward-compatible alias: redirect /health → /api/health
app.get('/health', (req, res) => {
  res.redirect('/api/health');
});

// Mount all versioned API routes under /api
app.use('/api', apiRoutes);

// Catch-all for unknown routes: JSON 404
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Central error handler: log and return JSON 500
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack || err, err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start HTTP server on configured port (default 4000)
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Load the interest scheduler (daily/monthly/yearly)
require('./interest');
console.log('[interest] cron loaded');
