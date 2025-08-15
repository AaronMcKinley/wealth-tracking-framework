import Helpers from '../helpers/actions';
import AddInvestment from '../addinvestment/actions';

const T = 'SOL';
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
      cy.intercept('GET', `**/api/assets/${T}`, { statusCode: 200, body: { current_price: BUY_PRICE } }).as('priceBuy');
      AddInvestment.startAddFromDashboard();
      AddInvestment.search(T);
      AddInvestment.pickSuggestionTicker(T);
      cy.wait('@priceBuy');
    },

    fillQtyAndWireNetwork() {
      AddInvestment.typeAmount(BUY_QTY);
    },

    confirmAndReturn() {
      cy.intercept('POST', '**/api/investments', (req) => {
        const b = req.body;
        expect(b).to.include({ name: T, total_value: BUY_PRICE * BUY_QTY });
        expect(b.amount).to.be.closeTo(BUY_QTY, 1e-9);
        req.reply({ statusCode: 200, body: { ok: true } });
      }).as('postBuy');
      AddInvestment.openConfirm();
      AddInvestment.confirm();
      cy.wait('@postBuy');
      Helpers.pathHas('/dashboard');
    },
  },

  sellInvestment: {
    openAndPrepare() {
      cy.intercept('GET', '**/api/investments*', {
        statusCode: 200,
        body: [{ asset_ticker: T, asset_name: T, type: 'crypto', total_quantity: BUY_QTY }],
      }).as('holdingsSOL');
      cy.intercept('GET', `**/api/assets/${T}`, { statusCode: 200, body: { current_price: SELL_PRICE } }).as('priceSell');
      AddInvestment.startSellFromDashboard();
      cy.wait('@holdingsSOL');
      AddInvestment.selectSellTicker(T);
      cy.wait('@priceSell');
    },

    fillQtyAndWireNetwork() {
      AddInvestment.typeAmount(SELL_QTY);
      AddInvestment.typeTotalSpend(SELL_PRICE * SELL_QTY);
    },

    confirmAndReturn() {
      cy.intercept('POST', '**/api/investments', (req) => {
        const b = req.body;
        expect(b).to.include({ name: T, total_value: SELL_PRICE * SELL_QTY });
        expect(b.amount).to.be.closeTo(-SELL_QTY, 1e-9);
        req.reply({ statusCode: 200, body: { ok: true } });
      }).as('postSell');
      AddInvestment.openConfirm();
      AddInvestment.confirm();
      cy.wait('@postSell');
      Helpers.pathHas('/dashboard');
    },
  },

  navigateAndAssert: {
    openTransactionsFromDashboard() {
      cy.intercept('GET', /\/transactions\/[^/?#]+\/?(?:\?.*)?$/i, (req) => {
        if (/\/transactions\/sol(\/|\?|$)/i.test(req.url)) {
          req.reply({
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
          });
        }
      }).as('getTxSOL');

      cy.get('body').then(($b) => {
        const $row = $b.find('td').filter((i, el) => /\bSOL\b/.test((el.textContent || '').trim())).first().closest('tr');
        const $link = $row.find('a,button').filter((i, el) => /transactions/i.test((el.textContent || '').trim()));
        if ($link.length) cy.wrap($link).click();
        else cy.visit('/transactions/sol');
      });

      cy.wait('@getTxSOL');
      cy.get('h1').should('contain.text', 'SOL Transactions');
    },

    verifyRealizedPL() {
      cy.contains('td', '5.00').should('be.visible');
    },
  },
};

export default Transactions;
