import Helpers from '../helpers/actions';
import AddInvestment from '../addinvestment/actions';
import InvestmentLocators from '../addinvestment/locators';

const TICKER = 'SOL';
const BUY_QTY = 2;
const BUY_PPU = 50;
const SELL_QTY = 1;
const SELL_PPU = 55;
const EUR = (n) => `€${Number(n).toFixed(2)}`;

const txRows = () => ([
  {
    id: 1,
    transaction_type: 'Buy',
    quantity: BUY_QTY,
    price_per_unit: BUY_PPU,
    total_value: BUY_QTY * BUY_PPU,
    fees: 0,
    transaction_date: new Date().toISOString(),
    realized_profit_loss: null,
  },
  {
    id: 2,
    transaction_type: 'Sell',
    quantity: SELL_QTY,
    price_per_unit: SELL_PPU,
    total_value: SELL_QTY * SELL_PPU,
    fees: 0,
    transaction_date: new Date().toISOString(),
    realized_profit_loss: (SELL_PPU - BUY_PPU) * SELL_QTY,
  },
]);

const holdRow = (qty, price) => ({
  id: 1,
  asset_name: 'Solana',
  asset_ticker: TICKER,
  type: 'crypto',
  total_quantity: qty,
  average_buy_price: BUY_PPU,
  current_price: price,
  current_value: qty * price,
  profit_loss: (price - BUY_PPU) * qty,
  percent_change_24h: 0,
  total_profit_loss: (price - BUY_PPU) * qty,
});

const Transactions = {
  setup: {
    dashboardEmpty() {
      cy.intercept('GET', '**/api/investments*', { statusCode: 200, body: [] }).as('getInv');
      Helpers.visit('/dashboard');
      cy.wait('@getInv');
    },
  },

  addInvestment: {
    openAndSelect() {
      AddInvestment.interceptPrice(TICKER, BUY_PPU, 'priceSOL');
      AddInvestment.startAddFromDashboard();
      AddInvestment.search(TICKER);
      AddInvestment.pickSuggestionTicker(TICKER);
      cy.wait('@priceSOL');
      cy.get(InvestmentLocators.form.unitPrice).should('have.value', EUR(BUY_PPU));
    },

    fillQtyAndWireNetwork() {
      AddInvestment.typeAmount(BUY_QTY);
      cy.get(InvestmentLocators.form.totalSpend).should('have.value', (BUY_QTY * BUY_PPU).toFixed(2));
      AddInvestment.interceptPostAddAssert(
        { name: TICKER, amount: BUY_QTY, total_value: BUY_QTY * BUY_PPU, type: 'crypto' },
        'postSOLBuy'
      );
    },

    confirmAndReturn() {
      cy.intercept('GET', '**/api/investments*', { statusCode: 200, body: [holdRow(BUY_QTY, BUY_PPU)] }).as('invAfterBuy');
      AddInvestment.openConfirm();
      AddInvestment.confirm();
      cy.wait(['@postSOLBuy', '@invAfterBuy']);
      cy.location('pathname', { timeout: 10000 }).should('match', /(\/dashboard|\/)$/);
      AddInvestment.assertDashboardRow({ ticker: TICKER, qtyText: String(BUY_QTY), valueText: EUR(BUY_QTY * BUY_PPU) });
    },
  },

  sellInvestment: {
    openAndPrepare() {
      cy.intercept('GET', '**/api/investments*', { statusCode: 200, body: [holdRow(BUY_QTY, BUY_PPU)] }).as('holdingsSOL');
      AddInvestment.interceptPrice(TICKER, SELL_PPU, 'priceSOLSell');
      AddInvestment.startSellFromDashboard();
      Helpers.pathEq('/add-investment');
      cy.wait('@holdingsSOL');
      AddInvestment.selectSellTicker(TICKER);
      cy.wait('@priceSOLSell');
      cy.get(InvestmentLocators.form.unitPrice).should('have.value', EUR(SELL_PPU));
    },

    fillQtyAndWireNetwork() {
      AddInvestment.typeAmount(SELL_QTY);
      AddInvestment.typeTotalSpend(SELL_QTY * SELL_PPU);
      AddInvestment.interceptPostSellAssert(
        { name: TICKER, amount: -SELL_QTY, total_value: SELL_QTY * SELL_PPU, type: 'crypto' },
        'postSOLSell'
      );
    },

    confirmAndReturn() {
      cy.intercept('GET', '**/api/investments*', { statusCode: 200, body: [holdRow(BUY_QTY - SELL_QTY, SELL_PPU)] }).as('invAfterSellSOL');
      AddInvestment.openConfirm();
      AddInvestment.confirm();
      cy.wait(['@postSOLSell', '@invAfterSellSOL']);
      cy.location('pathname', { timeout: 10000 }).should('match', /(\/dashboard|\/)$/);
      AddInvestment.assertDashboardRow({
        ticker: TICKER,
        qtyText: String(BUY_QTY - SELL_QTY),
        valueText: EUR((BUY_QTY - SELL_QTY) * SELL_PPU),
      });
    },
  },

  navigateAndAssert: {
    openTransactionsFromDashboard() {
      cy.intercept('GET', `**/api/transactions/${TICKER}`, { statusCode: 200, body: txRows() }).as('txSOL');
      cy.location('pathname').then((p) => {
        if (!/\/dashboard/.test(p)) Helpers.visit('/dashboard');
      });

      cy.contains('td', TICKER, { timeout: 10000 })
        .parent('tr')
        .then(($row) => {
          const $link = $row.find('a[href*="/transactions"]');
          if ($link.length) {
            cy.wrap($link.first()).click();
          } else {
            cy.visit(`/transactions/${TICKER}`);
          }
        });

      cy.location('pathname', { timeout: 10000 }).should('include', `/transactions/${TICKER}`);
      cy.contains('h1', new RegExp(`${TICKER}\\s+Transactions`, 'i')).should('be.visible');
      cy.wait('@txSOL').its('response.statusCode').should('be.oneOf', [200, 304]);
    },

    verifyRealizedPL() {
      cy.get('table').should('exist');
      cy.contains('td', /^Sell$/i).parent('tr').within(() => {
        cy.get('td').eq(6).should('contain', (SELL_PPU - BUY_PPU).toFixed(2));
      });
    },
  },
};

export default Transactions;
