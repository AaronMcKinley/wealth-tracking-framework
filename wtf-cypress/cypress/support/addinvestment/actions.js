import { addInv } from './locators';

export const addInvestmentActions = {
  setAuth() {
    window.localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@wtf.app' }));
    window.localStorage.setItem('token', 'test-token');
  },

  visitBuy() {
    cy.visit('/add-investment');
  },

  visitSell() {
    cy.visit('/add-investment', {
      onBeforeLoad(win) {
        win.history.replaceState({ usr: { mode: 'sell' } }, '', '/add-investment');
      }
    });
  },

  typeSearch(q) {
    cy.get(addInv.searchInput).clear().type(q);
  },

  pickFirstSuggestion() {
    cy.get(addInv.suggestionItems).first().click();
  },

  typeAmount(v) {
    cy.get(addInv.amount).clear().type(String(v));
  },

  typeTotalSpend(v) {
    cy.get(addInv.totalSpend).clear().type(String(v));
  },

  openConfirm() {
    cy.get(addInv.submitBtn).click();
    cy.get(addInv.modal).should('be.visible');
  },

  confirm() {
    cy.get(addInv.modalConfirmBtn).click();
  },
};
