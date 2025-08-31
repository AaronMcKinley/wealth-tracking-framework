const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const authenticateToken = require('./middleware/authenticateToken');
const { calculateCompoundSavings, formatAmount } = require('./helpers/savings');

const router = express.Router();
const pool = new Pool();

const handleError = (res, msg = 'Internal server error', code = 500, err = null) => {
  if (err) {
    console.error('Error details:', err);
  } else {
    console.error(msg);
  }
  return res.status(code).json({ message: msg });
};

// Health check: confirms API is up and DB is reachable.
router.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1');
    if (result) {
      return res.status(200).json({ status: 'healthy' });
    } else {
      return res.status(500).json({ status: 'db query failed' });
    }
  } catch (err) {
    console.error('Healthcheck error:', err);
    return res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// Login: authenticate by email/password; returns 1h JWT + basic user info.
router.post('/login', async (req, res) => {
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
      { expiresIn: '1h' },
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    handleError(res, err.message || 'Internal server error', 500, err);
  }
});

// Signup: create a new user; returns 1h JWT + created profile.
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  try {
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, email, name',
      [name, email, hashedPassword],
    );
    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );
    res.status(201).json({
      message: 'Signup successful',
      token,
      user,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

// Investments (GET): return current user's holdings joined with live prices and P/L.
router.get('/investments', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const query = `
      SELECT
        i.id, i.user_id, i.asset_name, i.asset_ticker, i.type,
        i.total_quantity, i.average_buy_price,
        COALESCE(m.current_price, 0) AS current_price,
        COALESCE(m.percent_change_24h, 0) AS percent_change_24h,
        (COALESCE(m.current_price, 0) * i.total_quantity) AS current_value,
        ((COALESCE(m.current_price, 0) - i.average_buy_price) * i.total_quantity) AS profit_loss,
        i.total_profit_loss,
        i.created_at
      FROM investments i
      LEFT JOIN (
        SELECT ticker, current_price, price_change_percentage_24h AS percent_change_24h FROM cryptocurrencies
        UNION ALL
        SELECT
          ticker,
          current_price,
          CASE
            WHEN previous_close IS NOT NULL AND previous_close <> 0
              THEN ROUND(((current_price - previous_close) / previous_close) * 100, 2)
            ELSE NULL
          END AS percent_change_24h
        FROM stocks_and_funds
      ) m ON i.asset_ticker = m.ticker
      WHERE i.user_id = $1
      ORDER BY (COALESCE(m.current_price, 0) * i.total_quantity) DESC
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    handleError(res, 'Failed to fetch investments', 500, err);
  }
});

// Investments (POST): record a buy/sell transaction and update aggregated holdings.
router.post('/investments', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { name, type, amount, total_value } = req.body;

    if (!name || !type || amount === undefined || !total_value) {
      return handleError(res, 'Missing required fields', 400);
    }

    const quantity = Math.abs(Number(amount));
    if (isNaN(quantity) || quantity === 0) {
      return handleError(res, 'Amount must be non-zero', 400);
    }
    const pricePerUnit = Number(total_value) / quantity;
    if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
      return handleError(res, 'Invalid total or price per unit', 400);
    }
    const transactionType = Number(amount) > 0 ? 'buy' : 'sell';

    let assetResult;
    const lowerType = type.toLowerCase();

    if (lowerType === 'crypto') {
      assetResult = await pool.query(
        `SELECT name, ticker FROM cryptocurrencies WHERE LOWER(name) = LOWER($1) OR LOWER(ticker) = LOWER($1) LIMIT 1`,
        [name],
      );
    } else if (['stock', 'etf', 'bond', 'reit', 'commodity'].includes(lowerType)) {
      assetResult = await pool.query(
        `SELECT name, ticker FROM stocks_and_funds WHERE (LOWER(name) = LOWER($1) OR LOWER(ticker) = LOWER($1)) AND type = $2 LIMIT 1`,
        [name, lowerType],
      );
    } else {
      return handleError(res, `Unsupported type: ${type}`, 400);
    }

    if (assetResult.rows.length === 0) {
      return handleError(res, `Asset '${name}' not found`, 404);
    }

    const asset = assetResult.rows[0];
    let realizedProfitLoss = null;

    if (transactionType === 'sell') {
      const invRes = await pool.query(
        `SELECT total_quantity, average_buy_price, total_profit_loss
         FROM investments WHERE user_id = $1 AND asset_ticker = $2`,
        [user_id, asset.ticker],
      );
      if (invRes.rows.length === 0) {
        return handleError(res, 'No holdings to sell', 400);
      }
      const currentQty = parseFloat(invRes.rows[0].total_quantity);
      const avgBuy = parseFloat(invRes.rows[0].average_buy_price);
      const currentPL = parseFloat(invRes.rows[0].total_profit_loss);

      if (quantity > currentQty) {
        return handleError(res, `Insufficient holdings. You only have ${currentQty}.`, 400);
      }

      realizedProfitLoss = (pricePerUnit - avgBuy) * quantity;

      await pool.query(
        `INSERT INTO transactions
         (user_id, asset_ticker, transaction_type, quantity, price_per_unit, total_value, fees, realized_profit_loss, transaction_date)
         VALUES ($1, $2, 'sell', $3, $4, $5, 0, $6, NOW())`,
        [user_id, asset.ticker, quantity, pricePerUnit, Number(total_value), realizedProfitLoss],
      );

      const remainingQty = currentQty - quantity;

      if (remainingQty === 0) {
        await pool.query(
          `UPDATE investments
           SET total_quantity = 0,
               current_value = 0,
               profit_loss = 0,
               total_profit_loss = $1,
               updated_at = NOW()
           WHERE user_id = $2 AND asset_ticker = $3`,
          [currentPL + realizedProfitLoss, user_id, asset.ticker],
        );
      } else {
        await pool.query(
          `UPDATE investments
           SET total_quantity = $1,
               updated_at = NOW()
           WHERE user_id = $2 AND asset_ticker = $3`,
          [remainingQty, user_id, asset.ticker],
        );
      }
      return res.status(201).json({ message: 'Sell recorded', realizedProfitLoss });
    }

    await pool.query(
      `INSERT INTO transactions
        (user_id, asset_ticker, transaction_type, quantity, price_per_unit, total_value, fees, realized_profit_loss, transaction_date)
       VALUES ($1, $2, 'buy', $3, $4, $5, 0, null, NOW())`,
      [user_id, asset.ticker, quantity, pricePerUnit, Number(total_value)],
    );

    const agg = await pool.query(
      `SELECT
         SUM(CASE WHEN transaction_type = 'buy' THEN quantity ELSE -quantity END) AS total_quantity,
         SUM(CASE WHEN transaction_type = 'buy' THEN quantity * price_per_unit ELSE 0 END) AS total_buy_value,
         SUM(CASE WHEN transaction_type = 'buy' THEN quantity ELSE 0 END) AS total_buy_quantity
       FROM transactions
       WHERE user_id = $1 AND asset_ticker = $2`,
      [user_id, asset.ticker],
    );

    const total_quantity = parseFloat(agg.rows[0].total_quantity) || 0;
    const total_buy_quantity = parseFloat(agg.rows[0].total_buy_quantity) || 0;
    const average_price =
      total_buy_quantity > 0 ? parseFloat(agg.rows[0].total_buy_value) / total_buy_quantity : 0;

    const update = await pool.query(
      `UPDATE investments
       SET total_quantity = $1, average_buy_price = $2, updated_at = NOW()
       WHERE user_id = $3 AND asset_ticker = $4
       RETURNING *`,
      [total_quantity, average_price, user_id, asset.ticker],
    );

    if (update.rowCount === 0) {
      await pool.query(
        `INSERT INTO investments
         (user_id, asset_name, asset_ticker, type, total_quantity, average_buy_price, total_profit_loss, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 0, NOW())`,
        [user_id, asset.name, asset.ticker, type, total_quantity, average_price],
      );
    }

    res.status(201).json({ message: 'Buy recorded', quantity: total_quantity });
  } catch (err) {
    handleError(res, err.message || 'Failed to record transaction', 500, err);
  }
});

// Transactions (GET): list user's transactions for a ticker (most recent first).
router.get('/transactions/:ticker', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { ticker } = req.params;
    const query = `
      SELECT id, transaction_type, quantity, price_per_unit, total_value, fees, realized_profit_loss, transaction_date
      FROM transactions
      WHERE user_id = $1 AND LOWER(asset_ticker) = LOWER($2)
      ORDER BY transaction_date DESC
    `;
    const result = await pool.query(query, [userId, ticker]);
    res.json(result.rows);
  } catch (err) {
    handleError(res, 'Failed to fetch transactions', 500, err);
  }
});

// Asset price (GET): fetch current price for a crypto or stock/ETF by ticker.
router.get('/assets/:ticker', authenticateToken, async (req, res) => {
  const { ticker } = req.params;
  try {
    let asset = await pool.query(
      `SELECT ticker, current_price FROM cryptocurrencies WHERE LOWER(ticker) = LOWER($1) LIMIT 1`,
      [ticker],
    );
    if (asset.rows.length === 0) {
      asset = await pool.query(
        `SELECT ticker, current_price FROM stocks_and_funds WHERE LOWER(ticker) = LOWER($1) LIMIT 1`,
        [ticker],
      );
    }
    if (asset.rows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json({ ticker: asset.rows[0].ticker, current_price: asset.rows[0].current_price });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch asset price', error: err.message });
    console.error('Asset fetch error:', err);
  }
});

router.post('/savings/:id/interest/apply', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId } = req.user;
    const { id } = req.params;

    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT id, principal, total_interest_paid, interest_rate, compounding_frequency
       FROM savings_accounts
       WHERE id = $1 AND user_id = $2
       FOR UPDATE`,
      [id, userId],
    );
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Savings account not found' });
    }

    const acc = rows[0];

    const { nextPaymentAmount } = calculateCompoundSavings({
      principal: acc.principal,
      totalInterestPaid: acc.total_interest_paid,
      annualRate: acc.interest_rate,
      compoundingFrequency: acc.compounding_frequency,
    });

    const interest = Math.max(0, Number(nextPaymentAmount) || 0);
    const newPrincipal = Number(acc.principal) + interest;
    const newTotalInterest = Number(acc.total_interest_paid) + interest;

    const { nextPaymentAmount: nextAfter } = calculateCompoundSavings({
      principal: newPrincipal,
      totalInterestPaid: newTotalInterest,
      annualRate: acc.interest_rate,
      compoundingFrequency: acc.compounding_frequency,
    });

    const upd = await client.query(
      `UPDATE savings_accounts
       SET principal = $1,
           total_interest_paid = $2,
           next_payment_amount = $3,
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING id, provider, principal, interest_rate, compounding_frequency, total_interest_paid, next_payment_amount`,
      [newPrincipal, newTotalInterest, nextAfter, id, userId],
    );

    await client.query('COMMIT');
    return res.status(200).json({
      message: 'Interest applied',
      applied: Number(interest.toFixed(2)),
      account: upd.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return handleError(res, 'Failed to apply interest', 500, err);
  } finally {
    client.release();
  }
});

// Savings (GET): list user's savings accounts with computed next payout amount.
router.get('/savings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const q = `
      SELECT id, provider, principal, interest_rate, compounding_frequency, total_interest_paid, next_payment_amount, created_at, updated_at
      FROM savings_accounts
      WHERE user_id = $1
      ORDER BY principal DESC
    `;
    const result = await pool.query(q, [userId]);

    const savingsWithCalc = result.rows.map((account) => {
      const {
        id,
        provider,
        principal,
        interest_rate,
        compounding_frequency,
        total_interest_paid,
        next_payment_amount,
        created_at,
        updated_at,
      } = account;

      const calc = calculateCompoundSavings({
        principal,
        totalInterestPaid: total_interest_paid,
        annualRate: interest_rate,
        compoundingFrequency: compounding_frequency,
      });

      const next_payout = Number(
        next_payment_amount ?? calc.nextPaymentAmount,
      ).toFixed(2);

      return {
        id,
        provider,
        principal,
        interest_rate: Number(interest_rate).toFixed(2),
        compounding_frequency,
        total_interest_paid,
        created_at,
        updated_at,
        next_payout,
      };
    });

    res.json(savingsWithCalc);
  } catch (err) {
    console.error('Savings API error:', err);
    res
      .status(500)
      .json({ message: 'Failed to fetch savings accounts', error: err.message, stack: err.stack });
  }
});

// Savings (POST): create/update/remove savings amounts; recalculates next payout.
router.post('/savings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { provider, principal, interest_rate, compounding_frequency, mode = 'add' } = req.body;

    if (!provider || principal == null || !compounding_frequency) {
      return handleError(res, 'Missing required fields', 400);
    }

    const existing = await pool.query(
      `SELECT id, principal, interest_rate, compounding_frequency, total_interest_paid
       FROM savings_accounts
       WHERE user_id = $1 AND LOWER(provider) = LOWER($2)`,
      [userId, provider],
    );

    if (existing.rows.length > 0) {
      const current = existing.rows[0];
      const currentPrincipal = Number(current.principal);
      const change = Number(principal);
      const newPrincipal =
        mode === 'remove' ? currentPrincipal - change : currentPrincipal + change;

      if (newPrincipal < 0) {
        return handleError(res, 'Cannot withdraw more than the current balance', 400);
      }

      if (newPrincipal === 0) {
        await pool.query(`DELETE FROM savings_accounts WHERE id = $1`, [current.id]);
        return res.status(200).json({ message: 'Savings account removed completely' });
      }

      const updatedCalc = calculateCompoundSavings({
        principal: newPrincipal,
        totalInterestPaid: current.total_interest_paid,
        annualRate: interest_rate ?? current.interest_rate,
        compoundingFrequency: compounding_frequency,
      });

      await pool.query(
        `UPDATE savings_accounts
         SET principal = $1,
             interest_rate = $2,
             compounding_frequency = $3,
             next_payment_amount = $4,
             updated_at = NOW()
         WHERE id = $5`,
        [
          newPrincipal,
          Number(interest_rate ?? current.interest_rate),
          compounding_frequency,
          updatedCalc.nextPaymentAmount,
          current.id,
        ],
      );

      return res.status(200).json({
        message:
          mode === 'remove' ? 'Amount withdrawn from savings' : 'Updated existing savings account',
        principal: newPrincipal,
      });
    } else {
      if (mode === 'remove') {
        return handleError(res, 'No savings account found to remove from', 404);
      }

      const calc = calculateCompoundSavings({
        principal,
        totalInterestPaid: 0,
        annualRate: interest_rate,
        compoundingFrequency: compounding_frequency,
      });

      await pool.query(
        `INSERT INTO savings_accounts
          (user_id, provider, principal, interest_rate, compounding_frequency, total_interest_paid, next_payment_amount, created_at)
         VALUES ($1, $2, $3, $4, $5, 0, $6, NOW())`,
        [
          userId,
          provider,
          Number(principal),
          Number(interest_rate),
          compounding_frequency,
          calc.nextPaymentAmount,
        ],
      );
      return res.status(201).json({
        message: 'Savings account created successfully',
      });
    }
  } catch (err) {
    console.error('Savings API error (POST):', err);
    handleError(res, err.message || 'Failed to update savings account', 500, err);
  }
});

// User (GET): return current user's basic profile.
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.userId],
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json(rows[0]);
  } catch (err) {
    return handleError(res, 'Failed to fetch user', 500, err);
  }
});

// User (PUT): update current user's name/email (validates email format + uniqueness).
router.put('/user', authenticateToken, async (req, res) => {
  const { name, email } = req.body || {};

  if (!name || !email) {
    return handleError(res, 'name and email are required', 400);
  }
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isEmail) return handleError(res, 'invalid email format', 400);

  try {
    const { rows, rowCount } = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
      [name, email, req.user.userId],
    );
    if (!rowCount) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ message: 'Profile updated', user: rows[0] });
  } catch (err) {
    if (err && err.code === '23505') {
      return handleError(res, 'Email already in use', 409, err);
    }
    return handleError(res, 'Failed to update user', 500, err);
  }
});

// User (DELETE): delete current user's account.
router.delete('/user', authenticateToken, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.user.userId]);
    if (!rowCount) return res.status(404).json({ message: 'User not found' });
    return res.sendStatus(204);
  } catch (err) {
    return handleError(res, 'Failed to delete user', 500, err);
  }
});

module.exports = router;
