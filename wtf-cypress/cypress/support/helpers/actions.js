import { HelperLocators as HL } from './locators';

const H = {
  resetState: () => { cy.clearCookies(); cy.clearLocalStorage(); },
  visit: (path = '/') => cy.visit(path),
  pathEq: (p) => cy.location('pathname').should('eq', p),
  pathHas: (frag) => cy.location('pathname').should('include', frag),
  clickLogo: () => cy.get(HL.logoLink).should('be.visible').click(),
  clickHomeSignUp: () => cy.get(HL.homeSignUpLink).first().click(),
  clickHomeLogin:  () => cy.get(HL.homeLoginLink).first().click(),
  clickSignInLink: () => cy.get(HL.signInLink).first().click(),
  cancel:          () => cy.get(HL.cancelBtn).first().click(),
  typeName: (v) => cy.get(HL.nameInput).first().clear().type(v),
  typeEmail: (v) => cy.get(HL.emailInput).first().clear().type(v),
  typePassword: (idx, v) => cy.get(HL.passInputs).eq(idx).clear().type(v, { log: false }),
  submit: () => cy.get(HL.submitBtn).first().click(),
  expectFormError: () => cy.get(HL.errorMsg).should('exist'),

  genEmail: (prefix = 'e2e') => `${prefix}+${Date.now()}@example.com`,
};

export default H;
