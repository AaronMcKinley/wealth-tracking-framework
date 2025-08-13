import L from './addinvestmentlocators';

const addinvestmentactions = {
  setAuthBeforeLoad(win) {
    win.localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@wtf.app' }));
    win.localStorage.setItem('token', 'test-token');
  },
  visitDashboard() {
    cy.visit('/dashboard', { onBeforeLoad: (w) => this.setAuthBeforeLoad(w) });
  },
  visitAddInvestment() {
    cy.visit('/add-investment', { onBeforeLoad: (w) => this.setAuthBeforeLoad(w) });
  },
  clickDashboardAdd() {
    cy.contains(L.dashAddBtn, 'Add Investment').click();
  },
  clickDashboardSell() {
    cy.contains(L.dashSellBtn, 'Sell Investment').click();
  },
  typeSearch(q) {
    cy.get(L.searchInput).clear().type(q);
  },
  pickSuggestionByTicker(ticker) {
    cy.get(L.suggestionList).should('be.visible');
    cy.contains(L.suggestionItems, `(${ticker})`).click();
  },
  typeAmount(v) {
    cy.get(L.amount).clear().type(String(v));
  },
  typeTotalSpend(v) {
    cy.get(L.totalSpend).clear().type(String(v));
  },
  openConfirm() {
    cy.get(L.submitBtn).click();
    cy.get(L.modal).should('be.visible');
  },
  confirm() {
    cy.get(L.modalConfirmBtn).click();
  },
  selectSellTicker(ticker) {
    cy.get(L.sellSelect).select(ticker);
  },
  cancelForm() {
    cy.get(L.cancelBtn).click();
  }
};
export default addinvestmentactions;
