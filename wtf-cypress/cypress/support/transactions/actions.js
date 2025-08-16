const Transactions = {
  openDashboard() {
    cy.visit('/dashboard');
  },

  waitForHoldingsTable() {
    cy.get('table', { timeout: 20000 }).should('exist');
    cy.get('table tbody tr', { timeout: 20000 }).should('have.length.at.least', 1);
  },

  focusAssetRow(ticker) {
    const re = new RegExp(`\\b${ticker}\\b`, 'i');
    cy.contains('table tbody tr', re, { timeout: 20000 }).as('assetRow');
  },

  clickAssetTransactionsLinkOrRow() {
    cy.get('@assetRow').within(() => {
      cy.get('a[href*="/transactions/"]').then(($a) => {
        if ($a.length) {
          cy.wrap($a.first()).click({ force: true });
        } else {
          cy.root().click({ force: true });
        }
      });
    });
  },

  assertUrlForAsset(ticker) {
    const lower = ticker.toLowerCase();
    cy.location('pathname', { timeout: 20000 }).should('match', new RegExp(`/transactions/\\d+/${lower}$`, 'i'));
  },

  assertTransactionsPageLoaded(ticker) {
    cy.get('h1', { timeout: 20000 })
      .should('contain.text', ticker.toUpperCase())
      .and('contain.text', 'Transactions');
    cy.get('table tbody tr', { timeout: 20000 }).should('have.length.at.least', 1);
  },
};

export default Transactions;
