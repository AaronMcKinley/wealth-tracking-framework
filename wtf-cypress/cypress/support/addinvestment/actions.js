import InvestmentLocators from './locators';

const AddInvestment = {
  startAddFromDashboard() {
    cy.contains(InvestmentLocators.dashboard.addBtn, /^Add Investment$/i)
      .should('be.visible')
      .click();
  },

  startSellFromDashboard() {
    cy.contains(InvestmentLocators.dashboard.sellBtn, /^Sell Investment$/i)
      .should('be.visible')
      .click();
  },

  search(query) {
    cy.get(InvestmentLocators.form.searchInput).should('be.visible').clear().type(query);
  },

  pickSuggestionTicker(ticker) {
    cy.get(InvestmentLocators.form.suggestionList).should('be.visible');
    cy.contains(InvestmentLocators.form.suggestionItems, `(${ticker})`).click();
  },

  selectSellTicker(ticker) {
    cy.get(InvestmentLocators.sell.select).filter(':visible').first().should('be.enabled').select(ticker);
  },

  typeAmount(value) {
    cy.get(InvestmentLocators.form.amount).clear().type(String(value));
  },

  typeTotalSpend(value) {
    cy.get(InvestmentLocators.form.totalSpend).clear().type(String(value));
  },

  openConfirm() {
    cy.get(InvestmentLocators.form.submitBtn).should('be.enabled').click();
    cy.get(InvestmentLocators.modal.root).should('be.visible');
  },

  confirm() {
    cy.get(InvestmentLocators.modal.confirmBtn).should('be.visible').click();
  },

  cancelForm() {
    cy.get(InvestmentLocators.form.cancelBtn).should('be.visible').click();
  },
};

export default AddInvestment;
