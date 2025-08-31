// Calculate next period's interest payout from total amount (principal + interest) / APR / frequency (daily/weekly/monthly/yearly), returning { nextPaymentAmount }.
function calculateCompoundSavings({
  principal,
  annualRate,
  compoundingFrequency,
  totalAmount,
  totalInterestPaid,
  total_interest_paid,
}) {
  const p = Number(principal);
  const tip = Number(totalInterestPaid ?? total_interest_paid ?? 0);
  const total = Number.isFinite(Number(totalAmount)) ? Number(totalAmount) : (isNaN(p) ? 0 : p) + (isNaN(tip) ? 0 : tip);
  const apr = Number(annualRate);

  if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(apr) || apr <= 0) {
    return { nextPaymentAmount: 0 };
  }

  const freqMap = { daily: 365, weekly: 52, monthly: 12, yearly: 1 };
  const periodsPerYear = freqMap[String(compoundingFrequency || 'monthly').toLowerCase()] || 12;
  const ratePerPeriod = (apr / 100) / periodsPerYear;

  const nextPaymentAmount = total * ratePerPeriod;
  return { nextPaymentAmount };
}

// Format a number with prefix and fixed decimals, showing "<threshold" for tiny positives and "—" for invalid input.
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
