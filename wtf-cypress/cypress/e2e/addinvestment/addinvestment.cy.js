import Helpers from '../../support/helpers/actions';
import Login from '../../support/login/actions';
import { users } from '../../support/data/users';
import AddInvestments from '../../support/addinvestment/actions';
import InvestmentLocators from '../../support/addinvestment/locators';

describe('Investments — Add & Sell', { tags: ['@regression', '@investments', '@ui'] }, () => {
  beforeEach(() => {
    cy.session('validUser', () => {
      Login.loginForSession(users.validUser.email, users.validUser.password);
    });
    cy.intercept('GET', '**/api/investments*', { statusCode: 200, body: [] }).as('getInv');
    Helpers.visit('/dashboard');
    cy.wait('@getInv');
  });

  it('Dashboard → Add Investment → Cancel returns to Dashboard', () => {
    AddInvestments.startAddFromDashboard();
    Helpers.pathEq('/add-investment');
    AddInvestments.cancelForm();
    Helpers.pathEq('/dashboard');
  });

  it('Add a stock (AAPL)', () => {
    cy.intercept('GET', '**/api/assets/AAPL', { statusCode: 200, body: { current_price: 120 } }).as('priceAAPL');

    AddInvestments.startAddFromDashboard();
    AddInvestments.search('AAPL');
    AddInvestments.pickSuggestionTicker('AAPL');
    cy.wait('@priceAAPL');

    cy.get(InvestmentLocators.form.unitPrice).should('have.value', '€120.00');

    AddInvestments.typeAmount(2);
    cy.get(InvestmentLocators.form.totalSpend).should('have.value', '240.00');

    cy.intercept('POST', '**/api/investments', (req) => {
      const b = req.body;
      expect(b).to.include({ name: 'AAPL', amount: 2, total_value: 240 });
      expect(b.type).to.match(/stock/i);
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postAAPL');

    AddInvestments.openConfirm();
    AddInvestments.confirm();
    cy.wait('@postAAPL');
    Helpers.pathEq('/dashboard');
  });

  it('Add a crypto (BTC)', () => {
    cy.intercept('GET', '**/api/assets/BTC', { statusCode: 200, body: { current_price: 30000 } }).as('priceBTC');

    AddInvestments.startAddFromDashboard();
    AddInvestments.search('BTC');
    AddInvestments.pickSuggestionTicker('BTC');
    cy.wait('@priceBTC');

    cy.get(InvestmentLocators.form.unitPrice).should('have.value', '€30000.00');

    AddInvestments.typeAmount(0.1);
    cy.get(InvestmentLocators.form.totalSpend).should('have.value', '3000.00');

    cy.intercept('POST', '**/api/investments', (req) => {
      const b = req.body;
      expect(b).to.include({ name: 'BTC', total_value: 3000 });
      expect(b.amount).to.be.closeTo(0.1, 1e-9);
      expect(b.type).to.match(/crypto/i);
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postBTC');

    AddInvestments.openConfirm();
    AddInvestments.confirm();
    cy.wait('@postBTC');
    Helpers.pathEq('/dashboard');
  });

  it('Sell blocks oversell', () => {
    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [{ asset_ticker: 'AAPL', asset_name: 'Apple Inc.', type: 'stock', total_quantity: 2 }]
    }).as('holdings');
    cy.intercept('GET', '**/api/assets/AAPL', { statusCode: 200, body: { current_price: 100 } }).as('priceSell');

    AddInvestments.startSellFromDashboard();
    Helpers.pathEq('/add-investment');

    cy.wait('@holdings');
    AddInvestments.selectSellTicker('AAPL');
    cy.wait('@priceSell');

    cy.get(InvestmentLocators.form.unitPrice).should('have.value', '€100.00');

    AddInvestments.typeAmount(3);
    AddInvestments.typeTotalSpend(300);
    cy.get(InvestmentLocators.form.submitBtn).click();

    cy.get(InvestmentLocators.form.errorMsg)
      .should('contain', 'You can only sell up to 2 units of AAPL.');
  });

  it('Sell valid amount and dashboard shows 1 left', () => {
    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [{ asset_ticker: 'AAPL', asset_name: 'Apple Inc.', type: 'stock', total_quantity: 2 }]
    }).as('holdings2');
    cy.intercept('GET', '**/api/assets/AAPL', { statusCode: 200, body: { current_price: 100 } }).as('priceSell2');

    AddInvestments.startSellFromDashboard();
    Helpers.pathEq('/add-investment');

    cy.wait('@holdings2');
    AddInvestments.selectSellTicker('AAPL');
    cy.wait('@priceSell2');

    AddInvestments.typeAmount(1);
    AddInvestments.typeTotalSpend(100);

    cy.intercept('POST', '**/api/investments', (req) => {
      const b = req.body;
      expect(b).to.deep.include({ name: 'AAPL', total_value: 100, type: 'stock' });
      expect(b.amount).to.eq(-1);
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postSell1');

    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [{
        id: 1, asset_name: 'Apple Inc.', asset_ticker: 'AAPL', type: 'stock',
        total_quantity: 1, average_buy_price: 100, current_price: 100,
        current_value: 100, profit_loss: 0, percent_change_24h: 0, total_profit_loss: 0
      }]
    }).as('invAfterSell');

    AddInvestments.openConfirm();
    AddInvestments.confirm();
    cy.wait(['@postSell1', '@invAfterSell']);
    Helpers.pathEq('/dashboard');

    cy.contains('td', 'AAPL').parent('tr').within(() => {
      cy.get('td').eq(3).should('contain', '1');
      cy.get('td').eq(8).should('contain', '€100.00');
    });
  });
});
