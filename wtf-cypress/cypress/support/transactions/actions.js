const round2 = (n) => Number(n.toFixed(2));

const getTokenFromWindow = () =>
  cy.window({ log: false }).then((w) => w.localStorage.getItem('token') || null);

const ensureToken = () =>
  getTokenFromWindow().then((t) => {
    if (t) return t;
    return cy.visit('/dashboard').then(() =>
      getTokenFromWindow().then((t2) => {
        if (!t2) throw new Error('No auth token in localStorage; ensure Login.ensureSession sets it.');
        return t2;
      })
    );
  });

const authRequest = (options) =>
  ensureToken().then((token) =>
    cy.request({
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
    })
  );

const Transactions = {
  deleteTicker(ticker) {
    return authRequest({
      method: 'DELETE',
      url: `/api/transactions/${ticker}`,
      failOnStatusCode: false,
    });
  },

  buy(ticker, qty, price) {
    return authRequest({
      method: 'POST',
      url: '/api/investments',
      body: {
        name: ticker,
        amount: qty,
        total_value: round2(qty * price),
      },
    });
  },

  sell(ticker, qty, price) {
    return authRequest({
      method: 'POST',
      url: '/api/investments',
      body: {
        name: ticker,
        amount: -qty,
        total_value: round2(qty * price),
      },
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
