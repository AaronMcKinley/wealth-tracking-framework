function calculateCompoundSavings({
  principal,
  annualRate,
  compoundingFrequency
}) {
  principal = Number(principal);
  annualRate = Number(annualRate);

  if (isNaN(principal) || isNaN(annualRate)) {
    return { nextPaymentAmount: 0 };
  }

  const freqMap = {
    daily: 365,
    weekly: 52,
    monthly: 12,
    yearly: 1
  };

  const periodsPerYear = freqMap[compoundingFrequency] || 12;
  const ratePerPeriod = annualRate / 100 / periodsPerYear;

  const nextPaymentAmount = principal * ratePerPeriod;

  return { nextPaymentAmount };
}

function formatEuro(val) {
  const n = typeof val === 'number' ? val : Number(val);
  if (isNaN(n)) return '—';
  return '€' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatAmount(val, options = { lessThan: 0.01, prefix: '', minDigits: 2 }) {
  const num = Number(val);
  if (isNaN(num)) return '—';

  const { lessThan, prefix, minDigits } = options;

  if (num === 0) return prefix + '0.00';
  if (num > 0 && num < lessThan) return prefix + '<' + lessThan.toFixed(minDigits);
  return prefix + num.toLocaleString(undefined, {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: minDigits
  });
}

module.exports = { calculateCompoundSavings, formatEuro, formatAmount };
