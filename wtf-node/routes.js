const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const authenticateToken = require('./middleware/authenticateToken');
const { calculateCompoundSavings, formatEuro, toFixed2 } = require('./helpers/savings');

const router = express.Router();
const pool = new Pool();

const handleError = (res, msg = 'Internal server error', code = 500) => {
  console.error(msg);
  return res.status(code).json({ message: msg });
};

function formatPaymentAmount(value) {
  if (value >= 0.01) return Number(value).toFixed(2);
  if (value > 0) return '<0.01';
  return '0.00';
}

router.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1');
    if (result) {
      return res.status(200).json({ status: 'healthy' });
    } else {
      return res.status(500).json({ status: 'db query failed' });
    }
  } catch (err) {
    return res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// ...other routes unchanged...

router.get('/savings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const q = `
      SELECT id, provider, principal, interest_rate, compounding_frequency, total_interest_paid, created_at, updated_at
      FROM savings_accounts
      WHERE user_id = $1
      ORDER BY principal DESC
    `;
    const result = await pool.query(q, [userId]);
    const now = new Date();

    const savingsWithCalc = result.rows.map(account => {
      const {
        id,
        provider,
        principal,
        interest_rate,
        compounding_frequency,
        total_interest_paid,
        created_at,
        updated_at
      } = account;

      const calc = calculateCompoundSavings({
        principal,
        annualRate: interest_rate,
        compoundingFrequency: compounding_frequency,
        startDate: new Date(created_at),
        lastUpdate: new Date(updated_at || created_at),
        today: now,
      });

      return {
        id,
        provider,
        principal: formatEuro(calc.principal),
        interest_rate: toFixed2(interest_rate),
        compounding_frequency,
        total_interest_paid: formatEuro(calc.interest),
        created_at,
        updated_at,
        accrued_interest: formatEuro(calc.interest),
        expected_next_interest: formatEuro(calc.nextPaymentAmount),
        next_payout: formatPaymentAmount(calc.nextPaymentAmount)
      };
    });

    res.json(savingsWithCalc);
  } catch (err) {
    console.error("Savings API error:", err);
    res.status(500).json({ message: 'Failed to fetch savings accounts', error: err.message, stack: err.stack });
  }
});

router.post('/savings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { provider, principal, interest_rate, compounding_frequency } = req.body;

    if (!provider || principal == null || interest_rate == null || !compounding_frequency) {
      return handleError(res, 'Missing required fields', 400);
    }

    const existing = await pool.query(
      `SELECT id, principal, interest_rate, compounding_frequency
       FROM savings_accounts
       WHERE user_id = $1 AND LOWER(provider) = LOWER($2)`,
      [userId, provider]
    );

    if (existing.rows.length > 0) {
      const current = existing.rows[0];
      const newPrincipal = toFixed2(parseFloat(current.principal) + parseFloat(principal));

      await pool.query(
        `UPDATE savings_accounts
         SET principal = $1, interest_rate = $2, compounding_frequency = $3, updated_at = NOW()
         WHERE id = $4`,
        [
          newPrincipal,
          toFixed2(interest_rate),
          compounding_frequency,
          current.id
        ]
      );

      return res.status(200).json({
        message: 'Updated existing savings account',
        principal: newPrincipal
      });
    } else {
      const { nextPaymentAmount } = calculateCompoundSavings({
        principal: Number(principal),
        annualRate: Number(interest_rate),
        compoundingFrequency: compounding_frequency,
        startDate: new Date(),
        lastUpdate: new Date()
      });

      await pool.query(
        `INSERT INTO savings_accounts
          (user_id, provider, principal, interest_rate, compounding_frequency, total_interest_paid, next_payment_amount, created_at)
         VALUES ($1, $2, $3, $4, $5, 0, $6, NOW())
         RETURNING id, provider, principal, interest_rate, compounding_frequency, total_interest_paid, next_payment_amount`,
        [
          userId,
          provider,
          toFixed2(principal),
          toFixed2(interest_rate),
          compounding_frequency,
          toFixed2(nextPaymentAmount)
        ]
      );
      return res.status(201).json({
        message: 'Savings account created successfully'
      });
    }
  } catch (err) {
    console.error("Savings API error (POST):", err);
    handleError(res, err.message || 'Failed to add savings account');
  }
});

module.exports = router;
