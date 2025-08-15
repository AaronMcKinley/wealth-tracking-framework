const InvestmentLocators = {
  dashboard: {
    addBtn: 'button.btn.btn-primary',
    sellBtn: 'button.btn.btn-negative',
    rowByTicker: (t) => `tbody tr:has(td:contains("${t}"))`,
  },
  form: {
    searchInput: '#searchInput',
    suggestionList: '#asset-suggestion-list',
    suggestionItems: '#asset-suggestion-list li[role="option"]',
    amount: '#amount',
    unitPrice: '#unitPrice',
    totalSpend: '#totalSpend',
    submitBtn: 'form button.btn.btn-primary[type="submit"]',
    cancelBtn: 'form button.btn.btn-negative',
    errorMsg: '.text-red-500',
  },
  sell: {
    select: 'form select',
  },
  modal: {
    root: '.fixed.inset-0',
    confirmBtn: '.fixed.inset-0 .btn.btn-primary',
    cancelBtn: '.fixed.inset-0 .btn.btn-negative',
  },
};
export default InvestmentLocators;
