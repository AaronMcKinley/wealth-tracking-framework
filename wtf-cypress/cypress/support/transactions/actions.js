import Helpers from '../helpers/actions';
import AddInvestment from '../addinvestment/actions';

const round2 = (n) => Number(n.toFixed(2));

const Tx = {
  dashboardEmpty() {
    cy.intercept('GET', '**/api/investments*', { statusCode: 200, body: [] }).as('invEmpty');
    Helpers.visit('/dashboard');
    cy.wait('@invEmpty');
  },

  buyUI(ticker, qty, price) {
    cy.intercept('GET', `**/api/assets/${ticker}`, {
      statusCode: 200,
      body: { current_price: price },
    }).as('priceBuy');

    AddInvestment.startAddFromDashboard();
    AddInvestment.search(ticker);
    AddInvestment.pickSuggestionTicker(ticker);
    cy.wait('@priceBuy');
    AddInvestment.typeAmount(qty);

    cy.intercept('POST', '**/api/investments', (req) => {
      const b = req.body;
      expect(b.name).to.eq(ticker);
      expect(b.amount).to.be.closeTo(qty, 1e-9);
      expect(round2(b.total_value)).to.eq(round2(qty * price));
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postBuy');

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
    }).as('invAfterBuy');

    AddInvestment.openConfirm();
    AddInvestment.confirm();
    cy.wait('@postBuy');
    Helpers.pathHas('/dashboard');
    cy.wait('@invAfterBuy');
  },

  sellUI(ticker, qty, price) {
    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [
        {
          asset_ticker: ticker,
          asset_name: ticker,
          type: 'crypto',
          total_quantity: qty * 2,
        },
      ],
    }).as('holdings');

    cy.intercept('GET', `**/api/assets/${ticker}`, {
      statusCode: 200,
      body: { current_price: price },
    }).as('priceSell');

    AddInvestment.startSellFromDashboard();
    cy.wait('@holdings');
    AddInvestment.selectSellTicker(ticker);
    cy.wait('@priceSell');

    AddInvestment.typeAmount(qty);
    AddInvestment.typeTotalSpend(round2(qty * price));

    cy.intercept('POST', '**/api/investments', (req) => {
      const b = req.body;
      expect(b.name).to.eq(ticker);
      expect(b.amount).to.be.closeTo(-qty, 1e-9);
      expect(round2(b.total_value)).to.eq(round2(qty * price));
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postSell');

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
    }).as('invAfterSell');

    AddInvestment.openConfirm();
    AddInvestment.confirm();
    cy.wait('@postSell');
    Helpers.pathHas('/dashboard');
    cy.wait('@invAfterSell');
  },

  openTransactionsByClick(ticker, buyQty, buyPrice, sellQty, sellPrice) {
    const realizedPL = round2((sellPrice - buyPrice) * sellQty);

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
          realized_profit_loss: realizedPL,
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

    cy.location('pathname').then((p) => {
      if (!/\/dashboard\/?$/.test(p)) cy.visit('/dashboard');
    });

    const upper = ticker.toUpperCase();
    const lower = ticker.toLowerCase();
    const selector = [
      `a[href^="/transactions/"][href$="/${upper}"]`,
      `a[href^="/transactions/"][href$="/${lower}"]`,
      `a[href*="/transactions/"][href$="/${upper}"]`,
      `a[href*="/transactions/"][href$="/${lower}"]`,
    ].join(', ');

    cy.get('body', { timeout: 15000 })
      .find(selector)
      .first()
      .click({ force: true });

    cy.location('pathname', { timeout: 15000 }).should((path) => {
      expect(path).to.match(new RegExp(`/transactions/.+/${upper}`, 'i'));
    });

    cy.wait('@getTx', { timeout: 30000 });
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

export default Tx;
