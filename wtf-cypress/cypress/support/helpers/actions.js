import L from './locators';

const TOKEN_KEY = Cypress.env('TOKEN_KEY') || 'token';

const Helper = {
  resetState: () => {
    cy.clearCookies();
    cy.window({ log: false }).then((w) => {
      try {
        w.localStorage.clear();
      } catch {}
      try {
        w.sessionStorage.clear();
      } catch {}
    });
  },

  visit: (path = '/') => cy.visit(path),
  pathEq: (p) => cy.location('pathname').should('eq', p),
  pathHas: (frag) => cy.location('pathname').should('include', frag),

  clickLogo: () => cy.get(L.logoLink).should('be.visible').first().click(),

  goHome: () => {
    cy.get('body').then(($b) => {
      const hasLogo = $b.find(L.logoLink).length > 0;
      if (hasLogo) cy.get(L.logoLink).first().click();
      else cy.visit('/');
    });
  },

  ensureLoggedOut: () => {
    cy.clearCookies();
    cy.window({ log: false }).then((w) => {
      try {
        w.localStorage.removeItem(TOKEN_KEY);
      } catch {}
      try {
        w.sessionStorage.clear();
      } catch {}
    });
    Helper.goHome();
    cy.window().should((w) => {
      expect(w.localStorage.getItem(TOKEN_KEY)).to.be.null;
    });
  },

  assertLoggedOut: () => {
    cy.contains('a,button', /(login|sign in)/i).should('be.visible');
  },

  typeName: (v) => cy.get(L.nameInput).first().clear().type(v),
  typeEmail: (v) => cy.get(L.emailInput).first().clear().type(v),
  typePassword: (idx, v) => cy.get(L.passInputs).eq(idx).clear().type(v, { log: false }),
  submit: () => cy.get(L.submitBtn).first().click(),

  expectFormError: () =>
    cy.get('body').then(($b) => {
      const hasExplicit = $b.find(L.errorMsg).length > 0;
      if (hasExplicit) cy.get(L.errorMsg).should('be.visible');
      else cy.contains(/(invalid|required|error)/i).should('be.visible');
    }),

  expectSuccess: () =>
    cy.get('body').then(($b) => {
      const hasExplicit = $b.find(L.successMsg).length > 0;
      if (hasExplicit) cy.get(L.successMsg).should('be.visible');
      else cy.contains(/(saved|updated|success)/i).should('be.visible');
    }),

  waitForDialog: () => cy.get(L.dialog, { timeout: 10000 }).should('be.visible'),
  dialogConfirmWith: (text) => {
    if (text != null) cy.get(L.dialogInput).clear().type(text);
    cy.get(L.dialogConfirmBtn).should('not.be.disabled').click();
  },
  dialogCancel: () => cy.get(L.dialogCancelBtn).click(),

  genEmail: (prefix = 'e2e') => `${prefix}+${Date.now()}@example.com`,
};

export default Helper;
