import LoginLocators from './locators';

const TOKEN_KEY = Cypress.env('TOKEN_KEY') || 'token';

const Login = {
  visitLoginPage() {
    cy.visit('/login');
    cy.get(LoginLocators.emailInput, { timeout: 10000 }).should('be.visible');
  },

  fillCredentials(email, password) {
    cy.get(LoginLocators.emailInput).first().clear().type(email);
    cy.get(LoginLocators.passwordInput).first().clear().type(password, { log: false });
  },

  submitLogin() {
    cy.get(LoginLocators.submitButton).first().click();
  },

  verifySuccessfulLogin() {
    cy.window().then((w) => {
      const token = w.localStorage.getItem(TOKEN_KEY);
      expect(token).to.be.a('string').and.match(/^ey/);
    });
    cy.location('pathname', { timeout: 10000 }).should((p) => {
      expect(p).to.match(/^\/(?:dashboard)?\/?$/);
    });
  },

  verifySuccessfulLoginStrict() {
    cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard');
    cy.get('header').should('contain.text', 'Wealth Tracking Framework');
  },

  login(email, password) {
    this.visitLoginPage();
    this.fillCredentials(email, password);
    this.submitLogin();
  },

  loginSuccessfully(email, password) {
    this.login(email, password);
    this.verifySuccessfulLogin();
  },

  loginForSession(email, password) {
    this.visitLoginPage();
    this.fillCredentials(email, password);
    this.submitLogin();
    cy.window().then((w) => {
      const token = w.localStorage.getItem(TOKEN_KEY);
      expect(token, `localStorage "${TOKEN_KEY}" set`).to.be.a('string').and.match(/^ey/);
    });
  },

  loginWithInvalidCredentials(email, password) {
    this.login(email, password);
    cy.get(LoginLocators.errorMessage)
      .should('be.visible')
      .and('contain.text', 'Invalid credentials');
  },
};

export default Login;
