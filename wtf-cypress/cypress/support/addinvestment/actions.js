import L from './locators';

const AddInvestments = {
  startAddFromDashboard() {
    cy.contains(L.dashboard.addBtn, /^Add Investment$/i).should('be.visible').click();
  },

  startSellFromDashboard() {
    cy.contains(L.dashboard.sellBtn, /^Sell Investment$/i).should('be.visible').click();
  },

  search(query) {
    cy.get(L.form.searchInput).should('be.visible').clear().type(query);
  },

  pickSuggestionTicker(ticker) {
    cy.get(L.form.suggestionList).should('be.visible');
    cy.contains(L.form.suggestionItems, `(${ticker})`).click();
  },

  selectSellTicker(ticker) {
    cy.get(L.sell.select).filter(':visible').first().should('be.enabled').select(ticker);
  },

  typeAmount(value) {
    cy.get(L.form.amount).clear().type(String(value));
  },

  typeTotalSpend(value) {
    cy.get(L.form.totalSpend).clear().type(String(value));
  },

  openConfirm() {
    cy.get(L.form.submitBtn).should('be.enabled').click();
    cy.get(L.modal.root).should('be.visible');
  },

  confirm() {
    cy.get(L.modal.confirmBtn).should('be.visible').click();
  },

  cancelForm() {
    cy.get(L.form.cancelBtn).should('be.visible').click();
  },
};

export default AddInvestments;
