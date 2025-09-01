// wtf-node/interest.js
const cron = require('node-cron');
const { Pool } = require('pg');
const { calculateCompoundSavings } = require('./helpers/savings');

const pool = new Pool();
const TZ = 'Europe/Dublin';
process.env.TZ = TZ; // ensure process uses Dublin time

async function applyInterest(freq) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT id, principal, total_interest_paid, interest_rate, compounding_frequency
         FROM savings_accounts
        WHERE compounding_frequency = $1
        FOR UPDATE`,
      [freq],
    );

    for (const acc of rows) {
      const { nextPaymentAmount } = calculateCompoundSavings({
        principal: acc.principal,
        totalInterestPaid: acc.total_interest_paid,
        annualRate: acc.interest_rate,
        compoundingFrequency: acc.compounding_frequency,
      });

      const interest = Math.max(0, Number(nextPaymentAmount) || 0);
      if (!interest) continue;

      const newPrincipal = Number(acc.principal) + interest;
      const newTotalInterest = Number(acc.total_interest_paid) + interest;

      const { nextPaymentAmount: nextAfter } = calculateCompoundSavings({
        principal: newPrincipal,
        totalInterestPaid: newTotalInterest,
        annualRate: acc.interest_rate,
        compoundingFrequency: acc.compounding_frequency,
      });

      await client.query(
        `UPDATE savings_accounts
           SET principal = $1,
               total_interest_paid = $2,
               next_payment_amount = $3,
               updated_at = NOW()
         WHERE id = $4`,
        [newPrincipal, newTotalInterest, nextAfter, acc.id],
      );
    }

    await client.query('COMMIT');
    console.log(`[interest] ${freq} applied to ${rows.length} account(s)`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(`[interest] ${freq} failed:`, e.message);
  } finally {
    client.release();
  }
}

function isLastDayOfMonth() {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return now.getDate() === last;
}

// Daily at 23:59 Dublin
cron.schedule('16 09 * * *', () => applyInterest('daily'), { timezone: TZ });

// Monthly at 23:59 on the last day of month
cron.schedule('59 23 28-31 * *', () => { if (isLastDayOfMonth()) applyInterest('monthly'); }, { timezone: TZ });

// Yearly at 23:59 on Dec 31
cron.schedule('59 23 31 12 *', () => applyInterest('yearly'), { timezone: TZ });

module.exports = { runOnce: applyInterest };
