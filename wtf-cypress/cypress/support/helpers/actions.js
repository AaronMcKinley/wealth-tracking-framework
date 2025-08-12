import { HelperLocators as HL } from './locators';
const TOKEN_KEY = Cypress.env('TOKEN_KEY') || 'token';

const H = {
  resetState: () => {
    cy.clearCookies();
    cy.window({ log: false }).then((w) => {
      try { w.localStorage.clear(); } catch {}
      try { w.sessionStorage.clear(); } catch {}
    });
  },

  visit: (path = '/') => cy.visit(path),
  pathEq: (p) => cy.location('pathname').should('eq', p),
  pathHas: (frag) => cy.location('pathname').should('include', frag),
  clickLogo: () => cy.get(HL.logoLink).should('be.visible').click(),

  goHome: () => {
    cy.get('body').then(($b) => {
      const hasLogo = $b.find(HL.logoLink).length > 0;
      if (hasLogo) cy.get(HL.logoLink).first().click();
      else cy.visit('/');
    });
  },
  ensureLoggedOut: () => {
    cy.clearCookies();
    cy.window({ log: false }).then((w) => {
      try { w.localStorage.removeItem(TOKEN_KEY); } catch {}
      try { w.sessionStorage.clear(); } catch {}
    });
    H.goHome();
    cy.window().should((w) => {
      expect(w.localStorage.getItem(TOKEN_KEY)).to.be.null;
    });
  },
  assertLoggedOut: () => {
    cy.contains('a,button', /(login|sign in)/i).should('be.visible');
  },
  typeName: (v) => cy.get(HL.nameInput).first().clear().type(v),
  typeEmail: (v) => cy.get(HL.emailInput).first().clear().type(v),
  typePassword: (idx, v) => cy.get(HL.passInputs).eq(idx).clear().type(v, { log: false }),
  submit: () => cy.get(HL.submitBtn).first().click(),

  expectFormError: () =>
    cy.get('body').then(($b) => {
      const hasExplicit = $b.find(HL.errorMsg).length > 0;
      if (hasExplicit) cy.get(HL.errorMsg).should('be.visible');
      else cy.contains(/(invalid|required|error)/i).should('be.visible');
    }),

  expectSuccess: () =>
    cy.get('body').then(($b) => {
      const hasExplicit = $b.find(HL.successMsg).length > 0;
      if (hasExplicit) cy.get(HL.successMsg).should('be.visible');
      else cy.contains(/(saved|updated|success)/i).should('be.visible');
    }),
  waitForDialog: () => cy.get(HL.dialog, { timeout: 10000 }).should('be.visible'),
  dialogConfirmWith: (text) => {
    if (text != null) cy.get(HL.dialogInput).clear().type(text);
    cy.get(HL.dialogConfirmBtn).should('not.be.disabled').click();
  },
  dialogCancel: () => cy.get(HL.dialogCancelBtn).click(),
  genEmail: (prefix = 'e2e') => `${prefix}+${Date.now()}@example.com`,
};

export default H;
