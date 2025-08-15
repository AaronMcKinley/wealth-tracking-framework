import InvestmentLocators from './locators';

const AddInvestment = {
  startAddFromDashboard() {
    cy.contains(InvestmentLocators.dashboard.addBtn, /^Add Investment$/i).should('be.visible').click();
  },

  startSellFromDashboard() {
    cy.contains(InvestmentLocators.dashboard.sellBtn, /^Sell Investment$/i).should('be.visible').click();
  },

  search(query) {
    cy.get(InvestmentLocators.form.searchInput).should('be.visible').clear().type(query);
  },

  pickSuggestionTicker(ticker) {
    cy.get(InvestmentLocators.form.suggestionList).should('be.visible');
    cy.contains(InvestmentLocators.form.suggestionItems, `(${ticker})`).click();
  },

  selectSellTicker(ticker) {
    cy.get(InvestmentLocators.sell.select).filter(':visible').first().should('be.enabled').select(ticker);
  },

  typeAmount(value) {
    cy.get(InvestmentLocators.form.amount).clear().type(String(value));
  },

  typeTotalSpend(value) {
    cy.get(InvestmentLocators.form.totalSpend).clear().type(String(value));
  },

  openConfirm() {
    cy.get(InvestmentLocators.form.submitBtn).should('be.enabled').click();
    cy.get(InvestmentLocators.modal.root).should('be.visible');
  },

  confirm() {
    cy.get(InvestmentLocators.modal.confirmBtn).should('be.visible').click();
  },

  cancelForm() {
    cy.get(InvestmentLocators.form.cancelBtn).should('be.visible').click();
  },

  interceptPrice(ticker, price, alias) {
    cy.intercept('GET', `**/api/assets/${ticker}`, { statusCode: 200, body: { current_price: price } }).as(alias);
    return `@${alias}`;
  },

  selectFromTypeaheadExpectPrice(ticker, priceAlias, expectedPrice) {
    this.search(ticker);
    this.pickSuggestionTicker(ticker);
    cy.wait(priceAlias);
    cy.get(InvestmentLocators.form.unitPrice).should('have.value', `€${Number(expectedPrice).toFixed(2)}`);
  },

  setAmountAndExpectTotal(amount, total) {
    this.typeAmount(amount);
    cy.get(InvestmentLocators.form.totalSpend).should('have.value', Number(total).toFixed(2));
  },

  interceptPostAddAssert(expected, alias) {
    cy.intercept('POST', '**/api/investments', (req) => {
      const b = req.body;
      if (typeof expected.amount !== 'undefined') {
        expect(b.amount).to.be.closeTo(expected.amount, 1e-9);
      }
      if (typeof expected.name !== 'undefined') {
        expect(b.name).to.eq(expected.name);
      }
      if (typeof expected.total_value !== 'undefined') {
        expect(b.total_value).to.eq(expected.total_value);
      }
      if (expected.type instanceof RegExp) {
        expect(b.type).to.match(expected.type);
      } else if (typeof expected.type === 'string') {
        expect(b.type).to.match(new RegExp(expected.type, 'i'));
      }
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as(alias);
    return `@${alias}`;
  },

  interceptHoldings(ticker, qty, alias) {
    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [{ asset_ticker: ticker, asset_name: ticker, type: 'stock', total_quantity: qty }],
    }).as(alias);
    return `@${alias}`;
  },

  oversellAndExpectError({ amount, total, maxAllowed, ticker }) {
    this.typeAmount(amount);
    this.typeTotalSpend(total);
    cy.get(InvestmentLocators.form.submitBtn).click();
    cy.get(InvestmentLocators.form.errorMsg).should('contain', `You can only sell up to ${maxAllowed} units of ${ticker}.`);
  },

  interceptPostSellAssert(expected, alias) {
    cy.intercept('POST', '**/api/investments', (req) => {
      const b = req.body;
      if (typeof expected.amount !== 'undefined') {
        expect(b.amount).to.eq(expected.amount);
      }
      if (typeof expected.name !== 'undefined') {
        expect(b.name).to.eq(expected.name);
      }
      if (typeof expected.total_value !== 'undefined') {
        expect(b.total_value).to.eq(expected.total_value);
      }
      if (expected.type instanceof RegExp) {
        expect(b.type).to.match(expected.type);
      } else if (typeof expected.type === 'string') {
        expect(b.type).to.match(new RegExp(expected.type, 'i'));
      }
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as(alias);
    return `@${alias}`;
  },

  interceptAfterSellHoldings({ ticker, qty, price }, alias) {
    cy.intercept('GET', '**/api/investments*', {
      statusCode: 200,
      body: [{
        id: 1, asset_name: ticker, asset_ticker: ticker, type: 'stock',
        total_quantity: qty, average_buy_price: price, current_price: price,
        current_value: qty * price, profit_loss: 0, percent_change_24h: 0, total_profit_loss: 0,
      }],
    }).as(alias);
    return `@${alias}`;
  },

  confirmAndWait(waitForAliases) {
    const toWait = Array.isArray(waitForAliases) ? waitForAliases : [waitForAliases];
    this.openConfirm();
    this.confirm();
    cy.wait(toWait);
  },

  assertDashboardRow({ ticker, qtyText, valueText }) {
    cy.contains('td', ticker).parent('tr').within(() => {
      if (qtyText) cy.get('td').eq(3).should('contain', qtyText);
      if (valueText) cy.get('td').eq(8).should('contain', valueText);
    });
  },
};

export default AddInvestment;
