import Helpers from '../helpers/actions';
import AddInvestment from '../addinvestment/actions';

const TICKER = 'SOL';
const BUY_QTY = 2;
const BUY_PRICE = 170.0;
const SELL_QTY = BUY_QTY / 2;
const SELL_PRICE = 175.0;
const round2 = (n) => Number(n.toFixed(2));
const EXPECTED_PL = round2((SELL_PRICE - BUY_PRICE) * SELL_QTY); // 5.00

const Transactions = {
  setup: {
    dashboardEmpty() {
      cy.intercept('GET', '**/api/investments*', { statusCode: 200, body: [] }).as('invEmpty');
      Helpers.visit('/dashboard');
      cy.wait('@invEmpty');
    },
  },

  simple: {
    buyAndSellHalfForProfit() {
      cy.intercept('GET', `**/api/assets/${TICKER}`, {
        statusCode: 200,
        body: { current_price: BUY_PRICE },
      }).as('priceBuy');

      AddInvestment.startAddFromDashboard();
      AddInvestment.search(TICKER);
      AddInvestment.pickSuggestionTicker(TICKER);
      cy.wait('@priceBuy');
      AddInvestment.typeAmount(BUY_QTY);

      cy.intercept('POST', '**/api/investments', (req) => {
        const b = req.body;
        expect(b.name).to.eq(TICKER);
        expect(b.amount).to.be.closeTo(BUY_QTY, 1e-9);
        expect(round2(b.total_value)).to.eq(round2(BUY_QTY * BUY_PRICE));
        req.reply({ statusCode: 200, body: { ok: true } });
      }).as('postBuy');

      cy.intercept('GET', '**/api/investments*', {
        statusCode: 200,
        body: [
          {
            asset_ticker: TICKER,
            asset_name: TICKER,
            type: 'crypto',
            total_quantity: BUY_QTY,
            price: BUY_PRICE,
          },
        ],
      }).as('invAfterBuy');

      AddInvestment.openConfirm();
      AddInvestment.confirm();
      cy.wait('@postBuy');
      Helpers.pathHas('/dashboard');
      cy.wait('@invAfterBuy');

      cy.intercept('GET', '**/api/investments*', {
        statusCode: 200,
        body: [
          {
            asset_ticker: TICKER,
            asset_name: TICKER,
            type: 'crypto',
            total_quantity: BUY_QTY,
          },
        ],
      }).as('holdings');

      cy.intercept('GET', `**/api/assets/${TICKER}`, {
        statusCode: 200,
        body: { current_price: SELL_PRICE },
      }).as('priceSell');

      AddInvestment.startSellFromDashboard();
      cy.wait('@holdings');
      AddInvestment.selectSellTicker(TICKER);
      cy.wait('@priceSell');

      AddInvestment.typeAmount(SELL_QTY);
      AddInvestment.typeTotalSpend(round2(SELL_QTY * SELL_PRICE));

      cy.intercept('POST', '**/api/investments', (req) => {
        const b = req.body;
        expect(b.name).to.eq(TICKER);
        expect(b.amount).to.be.closeTo(-SELL_QTY, 1e-9);
        expect(round2(b.total_value)).to.eq(round2(SELL_QTY * SELL_PRICE));
        req.reply({ statusCode: 200, body: { ok: true } });
      }).as('postSell');

      cy.intercept('GET', '**/api/investments*', {
        statusCode: 200,
        body: [
          {
            asset_ticker: TICKER,
            asset_name: TICKER,
            type: 'crypto',
            total_quantity: BUY_QTY - SELL_QTY,
            price: SELL_PRICE,
          },
        ],
      }).as('invAfterSell');

      AddInvestment.openConfirm();
      AddInvestment.confirm();
      cy.wait('@postSell');
      Helpers.pathHas('/dashboard');
      cy.wait('@invAfterSell');
    },

    openTransactions() {
      cy.intercept({ method: 'GET', url: '**/api/transactions**' }, (req) => {
        if (/transactions\/?([^/?]+)?/i.test(req.url) || req.url.includes('ticker=SOL')) {
          req.reply({
            statusCode: 200,
            body: [
              {
                id: 2,
                transaction_type: 'sell',
                quantity: SELL_QTY,
                price_per_unit: SELL_PRICE,
                total_value: round2(SELL_QTY * SELL_PRICE),
                fees: 0,
                transaction_date: new Date().toISOString(),
                realized_profit_loss: EXPECTED_PL,
              },
              {
                id: 1,
                transaction_type: 'buy',
                quantity: BUY_QTY,
                price_per_unit: BUY_PRICE,
                total_value: round2(BUY_QTY * BUY_PRICE),
                fees: 0,
                transaction_date: new Date(Date.now() - 2 * 86400000).toISOString(),
                realized_profit_loss: null,
              },
            ],
          });
        } else {
          req.continue();
        }
      }).as('getTx');
      cy.visit(`/transactions/${TICKER}`);
      cy.wait('@getTx', { timeout: 30000 })
        .its('response.statusCode')
        .should('be.within', 200, 299);

      cy.get('h1').should('contain.text', `${TICKER} Transactions`);
      cy.get('table tbody tr').should('have.length.at.least', 2);
    },

    expectProfitInTable() {
      const expected = EXPECTED_PL.toFixed(2);
      cy.get('table tbody tr')
        .contains('td', /^sell$/i)
        .parent()
        .within(() => {
          cy.get('td').should('contain.text', expected);
        });
    },
  },
};

export default Transactions;
