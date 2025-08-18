const Transactions = {
  openDashboard() {
    cy.visit('/dashboard');
  },

  waitForHoldingsTable() {
    cy.get('table', { timeout: 20000 }).should('exist');
    cy.get('table tbody tr', { timeout: 20000 }).should('have.length.at.least', 1);
  },

  focusAssetRow(ticker) {
    const reExactTicker = new RegExp(`^\\s*${ticker}\\s*$`, 'i');
    cy.contains('table tbody td', reExactTicker, { timeout: 20000 }).closest('tr').as('assetRow');
  },

  clickAssetRow() {
    cy.get('@assetRow').then(($row) => {
      const $link = $row.find('a[href*="/transactions/"]').first();
      if ($link.length) {
        cy.wrap($link).click({ force: true });
      } else {
        cy.wrap($row).click({ force: true });
      }
    });
  },

  assertUrlForAsset(ticker) {
    const lower = ticker.toLowerCase();
    cy.location('pathname', { timeout: 20000 }).should(
      'match',
      new RegExp(`/transactions/\\d+/${lower}$`, 'i'),
    );
  },

  assertTransactionsPageLoaded(ticker) {
    cy.get('h1', { timeout: 20000 })
      .should('contain.text', 'Transactions')
      .and('contain.text', ticker.toUpperCase());
    cy.get('table tbody tr', { timeout: 20000 }).should('have.length.at.least', 1);
  },
};

export default Transactions;
