import Helpers from '../helpers/actions';
import AddInvestment from '../addinvestment/actions';
import InvestmentLocators from '../addinvestment/locators';
import TL from './locators';

const TICKER = 'SOL';
const BUY_PRICE = 20;
const BUY_QTY = 2;
const SELL_PRICE = BUY_PRICE + 5;
const SELL_QTY = 1;

const fmt = (n) => Number(n).toFixed(2);
const rowByTicker = (ticker) =>
  InvestmentLocators?.dashboard?.rowByTicker
    ? InvestmentLocators.dashboard.rowByTicker(ticker)
    : `table tbody tr:has(td:contains("${ticker}"))`;

const setup = {
  dashboardEmpty() {
    cy.intercept('GET', '**/api/investments*', { statusCode: 200, body: [] }).as('invEmpty');
    Helpers.visit('/dashboard');
    cy.wait('@invEmpty');
  },
};

const addInvestment = {
  openAndSelect() {
    cy.intercept('GET', `**/api/assets/${TICKER}`, { statusCode: 200, body: { current_price: BUY_PRICE } }).as('priceBuy');
    AddInvestment.startAddFromDashboard();
    AddInvestment.search(TICKER);
    AddInvestment.pickSuggestionTicker(TICKER);
    cy.wait('@priceBuy');
    cy.get(InvestmentLocators.form.unitPrice).should('have.value', `€${fmt(BUY_PRICE)}`);
  },
  fillQtyAndWireNetwork() {
    AddInvestment.typeAmount(BUY_QTY);
    cy.get(InvestmentLocators.form.totalSpend).should('have.value', fmt(BUY_QTY * BUY_PRICE));
    cy.intercept('POST', '**/api/investments', (req) => {
      const b = req.body;
      expect(b).to.include({ name: TICKER, total_value: BUY_QTY * BUY_PRICE });
      expect(b.amount).to.be.closeTo(BUY_QTY, 1e-9);
      expect(b.type).to.match(/crypto/i);
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postBuy');
    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [{
        id: 10, asset_name: 'Solana', asset_ticker: TICKER, type: 'crypto',
        total_quantity: BUY_QTY, average_buy_price: BUY_PRICE, current_price: BUY_PRICE,
        current_value: BUY_QTY * BUY_PRICE, profit_loss: 0, percent_change_24h: 0, total_profit_loss: 0
      }]
    }).as('invAfterBuy');
  },
  confirmAndReturn() {
    AddInvestment.openConfirm();
    AddInvestment.confirm();
    cy.wait(['@postBuy', '@invAfterBuy']);
    Helpers.pathEq('/dashboard');
  },
};

const sellInvestment = {
  openAndPrepare() {
    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [{
        id: 10, asset_name: 'Solana', asset_ticker: TICKER, type: 'crypto',
        total_quantity: BUY_QTY, average_buy_price: BUY_PRICE, current_price: SELL_PRICE,
        current_value: BUY_QTY * SELL_PRICE, profit_loss: (SELL_PRICE - BUY_PRICE) * BUY_QTY, percent_change_24h: 0, total_profit_loss: (SELL_PRICE - BUY_PRICE) * BUY_QTY
      }]
    }).as('holdingsForSell');
    cy.intercept('GET', `**/api/assets/${TICKER}`, { statusCode: 200, body: { current_price: SELL_PRICE } }).as('priceSell');
    AddInvestment.startSellFromDashboard();
    Helpers.pathEq('/add-investment');
    cy.wait('@holdingsForSell');
    AddInvestment.selectSellTicker(TICKER);
    cy.wait('@priceSell');
    cy.get(InvestmentLocators.form.unitPrice).should('have.value', `€${fmt(SELL_PRICE)}`);
  },
  fillQtyAndWireNetwork() {
    AddInvestment.typeAmount(SELL_QTY);
    cy.get(InvestmentLocators.form.totalSpend).should('have.value', fmt(SELL_QTY * SELL_PRICE));
    cy.intercept('POST', '**/api/investments', (req) => {
      const b = req.body;
      expect(b).to.deep.include({ name: TICKER, total_value: SELL_QTY * SELL_PRICE, type: 'crypto' });
      expect(b.amount).to.eq(-SELL_QTY);
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postSell');
    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [{
        id: 10, asset_name: 'Solana', asset_ticker: TICKER, type: 'crypto',
        total_quantity: BUY_QTY - SELL_QTY, average_buy_price: BUY_PRICE, current_price: SELL_PRICE,
        current_value: (BUY_QTY - SELL_QTY) * SELL_PRICE, profit_loss: (SELL_PRICE - BUY_PRICE) * (BUY_QTY - SELL_QTY), percent_change_24h: 0, total_profit_loss: (SELL_PRICE - BUY_PRICE) * (BUY_QTY - SELL_QTY)
      }]
    }).as('invAfterSell');
  },
  confirmAndReturn() {
    AddInvestment.openConfirm();
    AddInvestment.confirm();
    cy.wait(['@postSell', '@invAfterSell']);
    Helpers.pathEq('/dashboard');
  },
};

const navigateAndAssert = {
  openTransactionsFromDashboard() {
    cy.intercept('GET', `**/api/transactions/${TICKER}`, {
      statusCode: 200,
      body: [
        { id: 1, transaction_type: 'Buy', quantity: BUY_QTY, price_per_unit: BUY_PRICE, total_value: BUY_QTY * BUY_PRICE, fees: 0, transaction_date: '2024-01-01T12:00:00Z', realized_profit_loss: null },
        { id: 2, transaction_type: 'Sell', quantity: SELL_QTY, price_per_unit: SELL_PRICE, total_value: SELL_QTY * SELL_PRICE, fees: 0, transaction_date: '2024-01-02T12:00:00Z', realized_profit_loss: (SELL_PRICE - BUY_PRICE) * SELL_QTY }
      ]
    }).as('getTx');
    cy.get(rowByTicker(TICKER)).within(() => {
      cy.get('a,button').filter(':visible').first().click({ force: true });
    });
    cy.wait('@getTx');
    cy.location('pathname').should('include', `/transactions/${TICKER}`);
  },
  verifyRealizedPL() {
    const expected = fmt((SELL_PRICE - BUY_PRICE) * SELL_QTY);
    cy.get(TL.table, { timeout: 10000 }).should('be.visible');
    cy.get(TL.headerCells).then(($ths) => {
      const idx = [...$ths].findIndex((th) => /realized.*p\/?l/i.test(th.textContent?.trim() || ''));
      expect(idx).to.be.gte(0);
      cy.get(TL.rows).contains('td', /sell/i).parent('tr').within(() => {
        cy.get(TL.cells).eq(idx).should('contain', expected);
      });
    });
  },
};

const Transactions = { setup, addInvestment, sellInvestment, navigateAndAssert };
export default Transactions;
