import addinvestmentlocators from '../../support/addinvestment/addinvestmentlocators';
import addinvestmentactions from '../../support/addinvestment/addinvestmentactions';

describe('Investments', function () {
  before(function () {
    this.locator = { addinvestment: addinvestmentlocators };
    this.action = { addinvestment: addinvestmentactions };
  });

  beforeEach(function () {
    cy.intercept('GET', '**/api/investments*', { statusCode: 200, body: [] }).as('getInv');
  });

  it('Dashboard → Add Investment → Cancel returns to Dashboard', function () {
    this.action.addinvestment.visitDashboard();
    cy.wait('@getInv');
    this.action.addinvestment.clickDashboardAdd();
    cy.location('pathname').should('eq', '/add-investment');
    this.action.addinvestment.cancelForm();
    cy.location('pathname').should('eq', '/dashboard');
  });

  it('Add a stock (AAPL)', function () {
    cy.intercept('GET', '**/api/assets/AAPL', { statusCode: 200, body: { current_price: 120 } }).as('priceAAPL');
    this.action.addinvestment.visitAddInvestment();
    this.action.addinvestment.typeSearch('AAPL');
    this.action.addinvestment.pickSuggestionByTicker('AAPL');
    cy.wait('@priceAAPL');
    cy.get(this.locator.addinvestment.unitPrice).should('have.value', '€120.00');
    this.action.addinvestment.typeAmount(2);
    cy.get(this.locator.addinvestment.totalSpend).should('have.value', '240.00');
    cy.intercept('POST', '**/api/investments', (req) => {
      const b = req.body;
      expect(b).to.include({ user_id: 1, name: 'AAPL', amount: 2, total_value: 240 });
      expect(b.type).to.match(/stock/i);
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postAAPL');
    this.action.addinvestment.openConfirm();
    this.action.addinvestment.confirm();
    cy.wait('@postAAPL');
    cy.location('pathname').should('eq', '/dashboard');
  });

  it('Add a crypto (BTC)', function () {
    cy.intercept('GET', '**/api/assets/BTC', { statusCode: 200, body: { current_price: 30000 } }).as('priceBTC');
    this.action.addinvestment.visitAddInvestment();
    this.action.addinvestment.typeSearch('BTC');
    this.action.addinvestment.pickSuggestionByTicker('BTC');
    cy.wait('@priceBTC');
    cy.get(this.locator.addinvestment.unitPrice).should('have.value', '€30000.00');
    this.action.addinvestment.typeAmount(0.1);
    cy.get(this.locator.addinvestment.totalSpend).should('have.value', '3000.00');
    cy.intercept('POST', '**/api/investments', (req) => {
      const b = req.body;
      expect(b).to.include({ user_id: 1, name: 'BTC', total_value: 3000 });
      expect(b.amount).to.be.closeTo(0.1, 1e-9);
      expect(b.type).to.match(/crypto/i);
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postBTC');
    this.action.addinvestment.openConfirm();
    this.action.addinvestment.confirm();
    cy.wait('@postBTC');
    cy.location('pathname').should('eq', '/dashboard');
  });

  it('Sell blocks oversell', function () {
    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [{ asset_ticker: 'AAPL', asset_name: 'Apple Inc.', type: 'stock', total_quantity: 5 }]
    }).as('holdings');
    cy.intercept('GET', '**/api/assets/AAPL', { statusCode: 200, body: { current_price: 100 } }).as('priceSell');
    this.action.addinvestment.visitDashboard();
    cy.wait('@holdings');
    this.action.addinvestment.clickDashboardSell();
    cy.location('pathname').should('eq', '/add-investment');
    cy.wait('@holdings');
    this.action.addinvestment.selectSellTicker('AAPL');
    cy.wait('@priceSell');
    cy.get(this.locator.addinvestment.unitPrice).should('have.value', '€100.00');
    this.action.addinvestment.typeAmount(6);
    this.action.addinvestment.typeTotalSpend(600);
    cy.get(this.locator.addinvestment.submitBtn).click();
    cy.get(this.locator.addinvestment.errorMsg).should('contain', 'You can only sell up to 5 units of AAPL.');
  });

  it('Sell valid amount', function () {
    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [{ asset_ticker: 'AAPL', asset_name: 'Apple Inc.', type: 'stock', total_quantity: 5 }]
    }).as('holdings2');
    cy.intercept('GET', '**/api/assets/AAPL', { statusCode: 200, body: { current_price: 100 } }).as('priceSell2');
    this.action.addinvestment.visitDashboard();
    cy.wait('@holdings2');
    this.action.addinvestment.clickDashboardSell();
    cy.location('pathname').should('eq', '/add-investment');
    cy.wait('@holdings2');
    this.action.addinvestment.selectSellTicker('AAPL');
    cy.wait('@priceSell2');
    this.action.addinvestment.typeAmount(5);
    this.action.addinvestment.typeTotalSpend(500);
    cy.intercept('POST', '**/api/investments', (req) => {
      const b = req.body;
      expect(b).to.deep.include({ name: 'AAPL', total_value: 500, type: 'stock' });
      expect(b.amount).to.eq(-5);
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postSell');
    this.action.addinvestment.openConfirm();
    this.action.addinvestment.confirm();
    cy.wait('@postSell');
    cy.location('pathname').should('eq', '/dashboard');
  });

  it('Buy 2, Sell 1 → dashboard shows 1 left and correct amounts', function () {
    cy.intercept('GET', '**/api/assets/AAPL', { statusCode: 200, body: { current_price: 100 } }).as('priceAAPL');

    this.action.addinvestment.visitAddInvestment();
    this.action.addinvestment.typeSearch('AAPL');
    this.action.addinvestment.pickSuggestionByTicker('AAPL');
    cy.wait('@priceAAPL');
    cy.get(this.locator.addinvestment.unitPrice).should('have.value', '€100.00');
    this.action.addinvestment.typeAmount(2);
    cy.get(this.locator.addinvestment.totalSpend).should('have.value', '200.00');

    cy.intercept('POST', '**/api/investments', (req) => {
      const b = req.body;
      expect(b).to.deep.include({ user_id: 1, name: 'AAPL', total_value: 200, type: 'stock' });
      expect(b.amount).to.eq(2);
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postBuy2');

    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [{ id: 1, asset_name: 'Apple Inc.', asset_ticker: 'AAPL', type: 'stock', total_quantity: 2, average_buy_price: 100, current_price: 100, current_value: 200, profit_loss: 0, percent_change_24h: 0, total_profit_loss: 0 }]
    }).as('invAfterBuy');

    this.action.addinvestment.openConfirm();
    this.action.addinvestment.confirm();
    cy.wait('@postBuy2');
    cy.wait('@invAfterBuy');
    cy.location('pathname').should('eq', '/dashboard');

    cy.contains('td', 'AAPL').parent('tr').within(() => {
      cy.get('td').eq(3).should('contain', '2');
      cy.get('td').eq(8).should('contain', '€200.00');
    });

    this.action.addinvestment.clickDashboardSell();
    cy.location('pathname').should('eq', '/add-investment');

    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [{ asset_ticker: 'AAPL', asset_name: 'Apple Inc.', type: 'stock', total_quantity: 2 }]
    }).as('holdingsForSell');

    cy.wait('@holdingsForSell');
    this.action.addinvestment.selectSellTicker('AAPL');

    cy.intercept('GET', '**/api/assets/AAPL', { statusCode: 200, body: { current_price: 100 } }).as('priceSellAgain');
    cy.wait('@priceSellAgain');

    this.action.addinvestment.typeAmount(1);
    this.action.addinvestment.typeTotalSpend(100);

    cy.intercept('POST', '**/api/investments', (req) => {
      const b = req.body;
      expect(b).to.deep.include({ name: 'AAPL', total_value: 100, type: 'stock' });
      expect(b.amount).to.eq(-1);
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postSell1');

    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [{ id: 1, asset_name: 'Apple Inc.', asset_ticker: 'AAPL', type: 'stock', total_quantity: 1, average_buy_price: 100, current_price: 100, current_value: 100, profit_loss: 0, percent_change_24h: 0, total_profit_loss: 0 }]
    }).as('invAfterSell');

    this.action.addinvestment.openConfirm();
    this.action.addinvestment.confirm();
    cy.wait('@postSell1');
    cy.wait('@invAfterSell');
    cy.location('pathname').should('eq', '/dashboard');

    cy.contains('td', 'AAPL').parent('tr').within(() => {
      cy.get('td').eq(3).should('contain', '1');
      cy.get('td').eq(8).should('contain', '€100.00');
    });
  });
});
