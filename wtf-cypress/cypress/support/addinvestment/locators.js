const addinvestmentlocators = {
  dashAddBtn: 'button:contains("Add Investment")',
  dashSellBtn: 'button:contains("Sell Investment")',
  searchInput: '#searchInput',
  suggestionList: '#asset-suggestion-list',
  suggestionItems: '#asset-suggestion-list li',
  amount: '#amount',
  unitPrice: '#unitPrice',
  totalSpend: '#totalSpend',
  submitBtn: 'form .btn.btn-primary',
  cancelBtn: 'form .btn.btn-negative',
  errorMsg: '.text-red-500.mb-4.text-center, [role="alert"]',
  modal: '.fixed.inset-0 .card',
  modalConfirmBtn: '.fixed.inset-0 .btn.btn-primary',
  sellSelect: 'label:contains("Asset to Sell") ~ select, select'
};
export default addinvestmentlocators;
