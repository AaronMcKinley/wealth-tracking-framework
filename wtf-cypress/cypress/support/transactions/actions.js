import Helpers from '../helpers/actions';
import AddInvestment from '../addinvestment/actions';

const TICKER = 'SOL';
const BUY_PRICE = 150;
const SELL_PRICE = BUY_PRICE + 5;
const BUY_QTY = 2;
const SELL_QTY = 1;

const Transactions = {
  setup: {
    dashboardEmpty() {
      cy.intercept('GET', '**/api/investments*', { statusCode: 200, body: [] }).as('invEmpty');
      Helpers.visit('/dashboard');
      cy.wait('@invEmpty');
    },
  },

  addInvestment: {
    openAndSelect() {
      cy.intercept('GET', `**/api/assets/${TICKER}`, {
        statusCode: 200,
        body: { current_price: BUY_PRICE },
      }).as('priceBuy');

      AddInvestment.startAddFromDashboard();
      AddInvestment.search(TICKER);
      AddInvestment.pickSuggestionTicker(TICKER);
      cy.wait('@priceBuy');
    },

    fillQtyAndWireNetwork() {
      AddInvestment.typeAmount(BUY_QTY);
    },

    confirmAndReturn() {
      cy.intercept('POST', '**/api/investments', (req) => {
        const b = req.body;
        expect(b.name).to.eq(TICKER);
        expect(b.total_value).to.eq(BUY_PRICE * BUY_QTY);
        expect(b.amount).to.be.closeTo(BUY_QTY, 1e-9);
        req.reply({ statusCode: 200, body: { ok: true } });
      }).as('postBuy');
      cy.intercept('GET', '**/api/investments*', {
        statusCode: 200,
        body: [
          { asset_ticker: TICKER, asset_name: TICKER, type: 'crypto', total_quantity: BUY_QTY, price: BUY_PRICE },
        ],
      }).as('invAfterBuy');

      AddInvestment.openConfirm();
      AddInvestment.confirm();

      cy.wait('@postBuy');
      Helpers.pathHas('/dashboard');
      cy.wait('@invAfterBuy');
    },
  },

  sellInvestment: {
    openAndPrepare() {
      cy.intercept('GET', '**/api/investments*', {
        statusCode: 200,
        body: [{ asset_ticker: TICKER, asset_name: TICKER, type: 'crypto', total_quantity: BUY_QTY }],
      }).as('holdingsSOL');

      cy.intercept('GET', `**/api/assets/${TICKER}`, {
        statusCode: 200,
        body: { current_price: SELL_PRICE },
      }).as('priceSell');

      AddInvestment.startSellFromDashboard();
      cy.wait('@holdingsSOL');
      AddInvestment.selectSellTicker(TICKER);
      cy.wait('@priceSell');
    },

    fillQtyAndWireNetwork() {
      AddInvestment.typeAmount(SELL_QTY);
      AddInvestment.typeTotalSpend(SELL_PRICE * SELL_QTY);
    },

    confirmAndReturn() {
      cy.intercept('POST', '**/api/investments', (req) => {
        const b = req.body;
        expect(b.name).to.eq(TICKER);
        expect(b.total_value).to.eq(SELL_PRICE * SELL_QTY);
        expect(b.amount).to.be.closeTo(-SELL_QTY, 1e-9);
        req.reply({ statusCode: 200, body: { ok: true } });
      }).as('postSell');
      cy.intercept('GET', '**/api/investments*', {
        statusCode: 200,
        body: [
          { asset_ticker: TICKER, asset_name: TICKER, type: 'crypto', total_quantity: BUY_QTY - SELL_QTY, price: SELL_PRICE },
        ],
      }).as('invAfterSell');

      AddInvestment.openConfirm();
      AddInvestment.confirm();

      cy.wait('@postSell');
      Helpers.pathHas('/dashboard');
      cy.wait('@invAfterSell');
    },
  },

  navigateAndAssert: {
    openTransactionsFromDashboard() {
      cy.intercept('GET', `**/api/transactions/${TICKER}*`, {
        statusCode: 200,
        body: [
          {
            id: 1,
            transaction_type: 'Buy',
            quantity: BUY_QTY,
            price_per_unit: BUY_PRICE,
            total_value: BUY_QTY * BUY_PRICE,
            fees: 0,
            transaction_date: new Date().toISOString(),
            realized_profit_loss: null,
          },
          {
            id: 2,
            transaction_type: 'Sell',
            quantity: SELL_QTY,
            price_per_unit: SELL_PRICE,
            total_value: SELL_QTY * SELL_PRICE,
            fees: 0,
            transaction_date: new Date().toISOString(),
            realized_profit_loss: SELL_PRICE - BUY_PRICE,
          },
        ],
      }).as('getTxSOL');

      cy.contains('tr', new RegExp(`\\b${TICKER}\\b`, 'i'), { timeout: 5000 })
        .within(() => {
          cy.get('a[href*="transactions"],button').first().click({ force: true });
        })
        .then(null, () => {
          cy.window().then((w) => {
            w.history.pushState({}, '', `/transactions/${TICKER.toLowerCase()}`);
            w.dispatchEvent(new Event('popstate'));
          });
        });

      cy.wait('@getTxSOL');
      cy.get('h1,header,[data-testid="page-title"]').should(($el) => {
        expect($el.text()).to.match(new RegExp(`${TICKER}\\s+Transactions`, 'i'));
      });
    },

    verifyRealizedPL() {
      cy.contains('td', (SELL_PRICE - BUY_PRICE).toFixed(2)).should('be.visible');
    },
  },
};

export default Transactions;
