const InvestmentLocators = {
  dashboard: {
    addBtn: 'button',
    sellBtn: 'button',
  },
  form: {
    searchInput: '#searchInput',
    suggestionList: '#asset-suggestion-list',
    suggestionItems: '#asset-suggestion-list li',
    amount: '#amount',
    unitPrice: '#unitPrice',
    totalSpend: '#totalSpend',
    submitBtn: 'form .btn.btn-primary',
    cancelBtn: 'form .btn.btn-negative',
    errorMsg: '.text-red-500.mb-4.text-center, [role="alert"]',
  },
  modal: {
    root: '.fixed.inset-0 .card',
    confirmBtn: '.fixed.inset-0 .btn.btn-primary',
    cancelBtn: '.fixed.inset-0 .btn.btn-negative',
  },
  sell: {
    select: 'select.input',
  },
};
export default InvestmentLocators;
