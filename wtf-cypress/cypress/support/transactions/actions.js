const round2 = (n) => Number(n.toFixed(2));

const Transactions = {
  deleteTicker(ticker) {
    cy.request({ method: 'DELETE', url: `/api/transactions/${ticker}`, failOnStatusCode: false });
  },

  buy(ticker, qty, price) {
    cy.request('POST', '/api/investments', {
      name: ticker,
      amount: qty,
      total_value: round2(qty * price),
    });
  },

  sell(ticker, qty, price) {
    cy.request('POST', '/api/investments', {
      name: ticker,
      amount: -qty,
      total_value: round2(qty * price),
    });
  },

  openTransactions(ticker) {
    cy.visit(`/transactions/${ticker}`);
    cy.get('h1').should('contain.text', `${ticker} Transactions`);
    cy.get('table tbody tr').should('have.length.at.least', 2);
  },

  assertProfitForSellRow(expectedNumber) {
    const expected = expectedNumber.toFixed(2);
    cy.get('table tbody tr')
      .contains('td', /^sell$/i)
      .parent()
      .within(() => {
        cy.get('td').then(($tds) => {
          const found = [...$tds].some((td) => td.innerText.replace(/[^\d.-]/g, '') === expected);
          expect(found).to.eq(true);
        });
      });
  },
};

export default Transactions;
