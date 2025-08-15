import SavingsLocators from './locators';

const Savings = {
  startAddFromDashboard() {
    cy.contains(SavingsLocators.dashboard.addBtnScope, /^Add Savings$/i).should('be.visible').click();
  },

  fillNewGoal({ name, target }) {
    cy.get(SavingsLocators.form.name).first().clear().type(name);
    cy.get(SavingsLocators.form.target).first().clear().type(String(target));
  },

  setAmount(v) {
    cy.get(SavingsLocators.form.amount).first().clear().type(String(v));
  },

  submitForm() {
    cy.get(SavingsLocators.form.submitBtn).first().should('be.enabled').click();
    cy.get('body');
  },

  openConfirm() {
    cy.get(SavingsLocators.modal.root).should('be.visible');
  },

  confirm() {
    cy.contains(SavingsLocators.modal.confirmBtn, /confirm/i).should('be.visible').click();
  },

  depositFlow({ name, amount }) {
    cy.contains('tr', new RegExp(name, 'i')).within(() => {
      cy.contains('button,a', /deposit/i).click();
    });
    this.setAmount(amount);
    this.submitForm();
    this.openConfirm();
    this.confirm();
  },

  withdrawFlow({ name, amount }) {
    cy.contains('tr', new RegExp(name, 'i')).within(() => {
      cy.contains('button,a', /withdraw/i).click();
    });
    this.setAmount(amount);
    this.submitForm();
    this.openConfirm();
    this.confirm();
  },

  expectOverdraftError(maxText) {
    cy.get('body').then(($b) => {
      const sel = SavingsLocators.errors?.msg;
      if (sel && $b.find(sel).length) cy.get(sel).should('contain', maxText);
      else cy.contains(/(insufficient|exceed|overdraft|cannot).*withdraw/i).should('be.visible');
    });
  },

  assertDashboardRow({ name, balanceText }) {
    cy.contains('td,th', new RegExp(name, 'i')).parents('tr').within(() => {
      cy.contains(/€|EUR|[0-9]/).should('contain', balanceText);
    });
  },

  interceptList({ name, balance = 0, target = 1000 }, alias = 'getSavings') {
    cy.intercept('GET', '**/api/savings*', {
      statusCode: 200,
      body: [{ id: 1, name, target_amount: target, current_amount: balance }],
    }).as(alias);
    return `@${alias}`;
  },

  interceptListEmpty(alias = 'getSavingsEmpty') {
    cy.intercept('GET', '**/api/savings*', { statusCode: 200, body: [] }).as(alias);
    return `@${alias}`;
  },

  interceptCreateAssert({ name, target }, alias = 'postSavings') {
    cy.intercept('POST', '**/api/savings', (req) => {
      expect(req.body).to.include({ name });
      expect(Number(req.body.target_amount ?? req.body.target)).to.eq(Number(target));
      req.reply({ statusCode: 200, body: { ok: true, id: 1, name, target_amount: target, current_amount: 0 } });
    }).as(alias);
    return `@${alias}`;
  },

  interceptDepositAssert({ amount }, alias = 'postDeposit') {
    cy.intercept('POST', '**/api/savings/*/deposit', (req) => {
      expect(Number(req.body.amount)).to.eq(Number(amount));
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as(alias);
    return `@${alias}`;
  },

  interceptWithdrawAssert({ amount }, alias = 'postWithdraw') {
    cy.intercept('POST', '**/api/savings/*/withdraw', (req) => {
      expect(Number(req.body.amount)).to.eq(Number(amount));
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as(alias);
    return `@${alias}`;
  },

  interceptAfterList({ name, balance, target = 1000 }, alias = 'getSavingsAfter') {
    cy.intercept('GET', '**/api/savings*', {
      statusCode: 200,
      body: [{ id: 1, name, target_amount: target, current_amount: balance }],
    }).as(alias);
    return `@${alias}`;
  },
};

export default Savings;
