import Helpers from '../helpers/actions';

const round2 = (n) => Number(n.toFixed(2));

const Transactions = {
  stubDashboardHolding(ticker, qty, price) {
    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [
        {
          asset_ticker: ticker,
          asset_name: ticker,
          type: 'crypto',
          total_quantity: qty,
          price,
        },
      ],
    }).as('invForDashboard');
  },

  stubTransactions(ticker, buyQty, buyPrice, sellQty, sellPrice) {
    const pl = round2((sellPrice - buyPrice) * sellQty);
    cy.intercept('GET', '**/api/transactions**', {
      statusCode: 200,
      body: [
        {
          id: 2,
          transaction_type: 'sell',
          quantity: sellQty,
          price_per_unit: sellPrice,
          total_value: round2(sellQty * sellPrice),
          fees: 0,
          transaction_date: new Date().toISOString(),
          realized_profit_loss: pl,
        },
        {
          id: 1,
          transaction_type: 'buy',
          quantity: buyQty,
          price_per_unit: buyPrice,
          total_value: round2(buyQty * buyPrice),
          fees: 0,
          transaction_date: new Date(Date.now() - 2 * 86400000).toISOString(),
          realized_profit_loss: null,
        },
      ],
    }).as('getTx');
  },

  openDashboardAndClickAsset(ticker) {
    const upper = ticker.toUpperCase();

    Helpers.visit('/dashboard');
    cy.get('body').then(() => {
      cy.wait('@invForDashboard', { timeout: 15000 }).catch(() => {});
    });
    cy.get('table', { timeout: 15000 }).should('exist');

    cy.contains('table td, table th', new RegExp(`\\b${upper}\\b`, 'i'), { timeout: 15000 })
      .closest('tr')
      .within(() => {
        cy.get('a[href*="/transactions/"]').then(($a) => {
          if ($a.length) {
            cy.wrap($a.first()).click({ force: true });
          } else {
            cy.root().click({ force: true });
          }
        });
      });

    cy.location('pathname', { timeout: 15000 }).should('match', new RegExp(`/transactions/\\d+/${upper}$`, 'i'));
  },

  openTransactionsByClick(ticker) {
    return this.openDashboardAndClickAsset(ticker);
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
