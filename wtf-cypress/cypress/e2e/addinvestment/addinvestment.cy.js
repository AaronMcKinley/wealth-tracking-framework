import AddInvestment from '../../support/addinvestment/actions';
import { users } from '../../support/data/users';
import Helpers from '../../support/helpers/actions';
import Login from '../../support/login/actions';

describe('Investments — Add & Sell', { tags: ['@regression', '@investments', '@ui'] }, () => {
  beforeEach(() => {
    Login.ensureSession(users.validUser.email, users.validUser.password, 'validUser:addsell');
    cy.intercept('GET', '**/api/investments*', { statusCode: 200, body: [] }).as('getInv');
    Helpers.visit('/dashboard');
    cy.wait('@getInv');
  });

  it('Dashboard Add Investment → Cancel returns to Dashboard', () => {
    AddInvestment.startAddFromDashboard();
    Helpers.pathEq('/add-investment');
    AddInvestment.cancelForm();
    Helpers.pathEq('/dashboard');
  });

  it('Add a stock (AAPL)', () => {
    const priceAlias = AddInvestment.interceptPrice('AAPL', 120, 'priceAAPL');
    AddInvestment.startAddFromDashboard();
    AddInvestment.selectFromTypeaheadExpectPrice('AAPL', priceAlias, 120);
    AddInvestment.setAmountAndExpectTotal(2, 240);
    const postAlias = AddInvestment.interceptPostAddAssert(
      { name: 'AAPL', amount: 2, total_value: 240, type: 'stock' },
      'postAAPL',
    );
    AddInvestment.confirmAndWait(postAlias);
    Helpers.pathEq('/dashboard');
  });

  it('Add a crypto (BTC)', () => {
    const priceAlias = AddInvestment.interceptPrice('BTC', 30000, 'priceBTC');
    AddInvestment.startAddFromDashboard();
    AddInvestment.selectFromTypeaheadExpectPrice('BTC', priceAlias, 30000);
    AddInvestment.setAmountAndExpectTotal(0.1, 3000);
    const postAlias = AddInvestment.interceptPostAddAssert(
      { name: 'BTC', amount: 0.1, total_value: 3000, type: 'crypto' },
      'postBTC',
    );
    AddInvestment.confirmAndWait(postAlias);
    Helpers.pathEq('/dashboard');
  });

  it('Sell blocks oversell', () => {
    AddInvestment.interceptHoldings('AAPL', 2, 'holdings');
    AddInvestment.interceptPrice('AAPL', 100, 'priceSell');
    AddInvestment.startSellFromDashboard();
    Helpers.pathEq('/add-investment');
    cy.wait('@holdings');
    AddInvestment.selectSellTicker('AAPL');
    cy.wait('@priceSell');
    AddInvestment.oversellAndExpectError({ amount: 3, total: 300, maxAllowed: 2, ticker: 'AAPL' });
  });

  it('Sell valid amount and dashboard shows 1 left', () => {
    AddInvestment.interceptHoldings('AAPL', 2, 'holdings2');
    AddInvestment.interceptPrice('AAPL', 100, 'priceSell2');
    AddInvestment.startSellFromDashboard();
    Helpers.pathEq('/add-investment');
    cy.wait('@holdings2');
    AddInvestment.selectSellTicker('AAPL');
    cy.wait('@priceSell2');
    AddInvestment.typeAmount(1);
    AddInvestment.typeTotalSpend(100);
    const postAlias = AddInvestment.interceptPostSellAssert(
      { name: 'AAPL', amount: -1, total_value: 100, type: 'stock' },
      'postSell1',
    );
    const afterAlias = AddInvestment.interceptAfterSellHoldings(
      { ticker: 'AAPL', qty: 1, price: 100 },
      'invAfterSell',
    );
    AddInvestment.confirmAndWait([postAlias, afterAlias]);
    Helpers.pathEq('/dashboard');
    AddInvestment.assertDashboardRow({ ticker: 'AAPL', qtyText: '1', valueText: '€100.00' });
  });
});
