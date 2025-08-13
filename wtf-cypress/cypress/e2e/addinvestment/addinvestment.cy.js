/// <reference types="cypress" />

import { addInv } from '../../support/addinvestment/locators';
import { addInvestmentActions as act } from '../../support/addinvestment/actions';

describe('Add Investment (buy)', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/assets/*', { statusCode: 200, body: { current_price: 50.5 } }).as('getPrice');
    cy.then(() => act.setAuth());
  });

  it('selects asset, auto-calculates spend, allows manual override, confirms and posts', () => {
    act.visitBuy();

    // trigger suggestions and pick one
    act.typeSearch('a');
    cy.get(addInv.suggestionList).should('be.visible');
    act.pickFirstSuggestion();

    // price fetched and displayed
    cy.wait('@getPrice');
    cy.get(addInv.unitPrice).should('have.value', '€50.50');

    // amount -> auto total (10 * 50.5)
    act.typeAmount(10);
    cy.get(addInv.totalSpend).should('have.value', '505.00');

    // manual override should stick
    act.typeTotalSpend(600);
    act.typeAmount(11);
    cy.get(addInv.totalSpend).should('have.value', '600');

    // intercept POST with final expectations
    cy.intercept('POST', '/api/investments', (req) => {
      const b = req.body;
      expect(b).to.have.keys(['user_id','name','amount','total_value','type']);
      expect(b.user_id).to.eq(1);
      expect(b.amount).to.eq(11);     // buy -> positive
      expect(b.total_value).to.eq(600);
      // type is from selected asset; we just assert it exists
      expect(b.type).to.be.a('string').and.not.be.empty;
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postBuy');

    // submit + confirm
    act.openConfirm();
    cy.contains(addInv.modal, 'Confirm Investment').should('be.visible');
    cy.contains(addInv.modal, 'Total Spend').should('contain', '€600');
    act.confirm();

    cy.wait('@postBuy');
    cy.location('pathname').should('eq', '/dashboard');
  });
});

describe('Sell Investment (validation + payload)', () => {
  beforeEach(() => {
    cy.then(() => act.setAuth());
    cy.intercept('GET', '/api/investments', {
      statusCode: 200,
      body: [
        { asset_ticker: 'AAPL', asset_name: 'Apple Inc.', type: 'stock', total_quantity: 5 },
        { asset_ticker: 'BTC', asset_name: 'Bitcoin', type: 'crypto', total_quantity: 0 },
      ],
    }).as('getHoldings');
    cy.intercept('GET', '/api/assets/*', { statusCode: 200, body: { current_price: 100 } }).as('getPriceSell');
  });

  it('prevents selling more than held and sends negative amount on success', () => {
    act.visitSell();
    cy.wait('@getHoldings');

    // select AAPL
    cy.contains('label', 'Asset to Sell').parent().find('select').as('sell');
    cy.get('@sell').select('AAPL');

    cy.wait('@getPriceSell');
    cy.get(addInv.unitPrice).should('have.value', '€100.00');

    // too much -> error message
    cy.get(addInv.amount).clear().type('6');
    cy.get(addInv.totalSpend).clear().type('600');
    cy.get(addInv.submitBtn).click();
    cy.get(addInv.errorMsg).should('contain', 'You can only sell up to 5 units of AAPL.');

    // valid sell 3
    cy.get(addInv.amount).clear().type('3');
    cy.get(addInv.totalSpend).clear().type('300');

    cy.intercept('POST', '/api/investments', (req) => {
      const b = req.body;
      expect(b.name).to.eq('AAPL');
      expect(b.amount).to.eq(-3);      // sell -> negative
      expect(b.total_value).to.eq(300);
      expect(b.type).to.eq('stock');
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postSell');

    act.openConfirm();
    cy.contains(addInv.modal, 'Confirm Sell').should('be.visible');
    act.confirm();

    cy.wait('@postSell');
    cy.location('pathname').should('eq', '/dashboard');
  });
});
