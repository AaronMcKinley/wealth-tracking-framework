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
    const upper = ticker.toUpperCase();
    const lower = ticker.toLowerCase();

    const selector = [
      `a[href^="/transactions/"][href$="/${upper}"]`,
      `a[href*="/transactions/"][href$="/${upper}"]`,
      `a[href^="/transactions/"][href$="/${lower}"]`,
      `a[href*="/transactions/"][href$="/${lower}"]`,
      `a[href^="https://"][href*="/transactions/"][href$="/${upper}"]`,
      `a[href^="https://"][href*="/transactions/"][href$="/${lower}"]`,
    ].join(', ');

    cy.location('pathname').then((p) => {
      if (!/\/dashboard\/?$/.test(p)) cy.visit('/dashboard');
    });

    cy.get('body', { timeout: 15000 }).then(($body) => {
      const $link = $body.find(selector);
      if ($link.length) {
        cy.wrap($link.first()).click({ force: true });
      } else {
        throw new Error(`No link to /transactions/:userId/${upper} found on the Dashboard`);
      }
    });

    cy.location('pathname', { timeout: 15000 }).should((path) => {
      expect(path).to.match(new RegExp(`/transactions/.+/${upper}`, 'i'));
    });

    cy.get('h1').should('contain.text', `${upper} Transactions`);
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
