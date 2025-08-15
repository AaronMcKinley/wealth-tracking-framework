import Helpers from '../helpers/actions';
import AddInvestment from '../addinvestment/actions';
import InvestmentLocators from '../addinvestment/locators';
import TxL from './locators';

const TICKER = 'SOL';
const BUY_PRICE = 20;
const SELL_PRICE = 25;

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
      const priceAlias = AddInvestment.interceptPrice(TICKER, BUY_PRICE, 'priceSOL');
      AddInvestment.startAddFromDashboard();
      AddInvestment.selectFromTypeaheadExpectPrice(TICKER, priceAlias, BUY_PRICE);
    },
    fillQtyAndWireNetwork() {
      AddInvestment.setAmountAndExpectTotal(2, BUY_PRICE * 2);
    },
    confirmAndReturn() {
      const postAlias = AddInvestment.interceptPostAddAssert(
        { name: TICKER, amount: 2, total_value: BUY_PRICE * 2, type: 'crypto' },
        'postSOLBuy'
      );
      const afterAlias = AddInvestment.interceptAfterSellHoldings(
        { ticker: TICKER, qty: 2, price: BUY_PRICE },
        'invAfterBuySOL'
      );
      AddInvestment.confirmAndWait([postAlias, afterAlias]);
      Helpers.pathEq('/dashboard');
      cy.contains('td', TICKER).should('exist');
    },
  },

  sellInvestment: {
    openAndPrepare() {
      AddInvestment.interceptHoldings(TICKER, 2, 'holdingsSOL');
      const priceAlias = AddInvestment.interceptPrice(TICKER, SELL_PRICE, 'priceSOLSell');
      AddInvestment.startSellFromDashboard();
      Helpers.pathEq('/add-investment');
      cy.wait('@holdingsSOL');
      AddInvestment.selectSellTicker(TICKER);
      cy.wait(priceAlias);
      cy.get(InvestmentLocators.form.unitPrice).should('have.value', `€${SELL_PRICE.toFixed(2)}`);
    },
    fillQtyAndWireNetwork() {
      AddInvestment.typeAmount(1);
      AddInvestment.typeTotalSpend(SELL_PRICE);
    },
    confirmAndReturn() {
      const postAlias = AddInvestment.interceptPostSellAssert(
        { name: TICKER, amount: -1, total_value: SELL_PRICE, type: 'crypto' },
        'postSOLSell'
      );
      const afterAlias = AddInvestment.interceptAfterSellHoldings(
        { ticker: TICKER, qty: 1, price: SELL_PRICE },
        'invAfterSellSOL'
      );
      AddInvestment.confirmAndWait([postAlias, afterAlias]);
      Helpers.pathEq('/dashboard');
      cy.contains('td', TICKER).should('exist');
    },
  },

  navigateAndAssert: {
    openTransactionsFromDashboard() {
      cy.intercept('GET', `**/api/transactions/${TICKER}`, {
        statusCode: 200,
        body: [
          {
            id: 1,
            transaction_type: 'Buy',
            quantity: 2,
            price_per_unit: BUY_PRICE,
            total_value: BUY_PRICE * 2,
            fees: 0,
            transaction_date: new Date().toISOString(),
            realized_profit_loss: null,
          },
          {
            id: 2,
            transaction_type: 'Sell',
            quantity: 1,
            price_per_unit: SELL_PRICE,
            total_value: SELL_PRICE,
            fees: 0,
            transaction_date: new Date().toISOString(),
            realized_profit_loss: SELL_PRICE - BUY_PRICE,
          },
        ],
      }).as('getTxSOL');

      Helpers.visit(`/transactions/${TICKER}`);
      cy.wait('@getTxSOL');
      cy.location('pathname', { timeout: 10000 }).should('match', /\/transactions\/sol$/i);
      cy.get(TxL.header, { timeout: 10000 }).should('contain.text', `${TICKER} Transactions`);
      cy.get(TxL.table).should('be.visible');
    },

    verifyRealizedPL() {
      cy.get(TxL.rows).should('have.length.at.least', 2);
      cy.get(TxL.rows).eq(1).within(() => {
        cy.get(TxL.cells).eq(0).should('contain.text', 'Sell');
        cy.get(TxL.cells).eq(6).should('contain.text', (SELL_PRICE - BUY_PRICE).toFixed(2));
      });
    },
  },
};

export default Transactions;
