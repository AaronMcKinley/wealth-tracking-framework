function calculateCompoundedSavings({
  principal,
  annualRate,
  compoundingFrequency,
  startDate,
  lastUpdate,
  today = new Date(),
}) {
  principal = Number(principal);
  annualRate = Number(annualRate);
  if (isNaN(principal) || isNaN(annualRate)) return { principal, interest: 0, periods: 0 };
  const freqMap = { daily: 365, weekly: 52, monthly: 12, yearly: 1 };
  const periodsPerYear = freqMap[compoundingFrequency] || 12;
  const from = new Date(lastUpdate || startDate);
  const to = today;
  let periods = 0;
  switch (compoundingFrequency) {
    case 'daily':
      periods = Math.floor((to - from) / (1000 * 60 * 60 * 24));
      break;
    case 'weekly':
      periods = Math.floor((to - from) / (1000 * 60 * 60 * 24 * 7));
      break;
    case 'monthly':
      periods =
        (to.getFullYear() - from.getFullYear()) * 12 +
        (to.getMonth() - from.getMonth());
      if (to.getDate() < from.getDate()) periods--;
      break;
    case 'yearly':
      periods = to.getFullYear() - from.getFullYear();
      if (
        to.getMonth() < from.getMonth() ||
        (to.getMonth() === from.getMonth() && to.getDate() < from.getDate())
      )
        periods--;
      break;
    default:
      periods = 0;
  }
  if (periods < 0) periods = 0;
  const ratePerPeriod = annualRate / 100 / periodsPerYear;
  const finalPrincipal = principal * Math.pow(1 + ratePerPeriod, periods);
  const interest = finalPrincipal - principal;
  return { periods, principal: finalPrincipal, interest };
}

function formatEuro(value) {
  if (typeof value !== "number" || isNaN(value)) return '—';
  if (value > 0 && value < 0.01) return '<0.01';
  if (value < 0 && value > -0.01) return '-<0.01';
  return `€${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

module.exports = {
  calculateCompoundedSavings,
  formatEuro,
};
