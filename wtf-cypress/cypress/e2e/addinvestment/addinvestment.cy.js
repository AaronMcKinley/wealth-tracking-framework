import addinvestmentlocators from '../../support/addinvestment/addinvestmentlocators';
import addinvestmentactions from '../../support/addinvestment/addinvestmentactions';

describe('Investments', function () {
  before(function () {
    this.locator = { addinvestment: addinvestmentlocators };
    this.action  = { addinvestment: addinvestmentactions };
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
  }
