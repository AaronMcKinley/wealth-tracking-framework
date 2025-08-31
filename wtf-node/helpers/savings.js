// Calculate next period's interest payout based on principal and APR/frequency.
function calculateCompoundSavings({
  principal,
  annualRate,
  compoundingFrequency,
}) {
  const balance = Number(principal); // principal already includes compounding growth
  const apr = Number(annualRate);

  if (!Number.isFinite(balance) || balance <= 0 || !Number.isFinite(apr) || apr <= 0) {
    return { nextPaymentAmount: 0 };
  }

  const freqMap = { daily: 365, weekly: 52, monthly: 12, yearly: 1 };
  const periodsPerYear =
    freqMap[String(compoundingFrequency || 'monthly').toLowerCase()] || 12;

  const ratePerPeriod = (apr / 100) / periodsPerYear;

  const nextPaymentAmount = balance * ratePerPeriod;
  return { nextPaymentAmount };
}

// Format helper unchanged
function formatAmount(val, options = { lessThan: 0.01, prefix: '', minDigits: 2 }) {
  const num = Number(val);
  if (isNaN(num)) return '—';

  const { lessThan, prefix, minDigits } = options;

  if (num === 0) return prefix + '0.00';
  if (num > 0 && num < lessThan) return prefix + '<' + lessThan.toFixed(minDigits);
  return (
    prefix +
    num.toLocaleString(undefined, {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: minDigits,
    })
  );
}

module.exports = { calculateCompoundSavings, formatAmount };
