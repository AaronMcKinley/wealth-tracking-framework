import LoginLocators from './locators';

const TOKEN_KEY = Cypress.env('TOKEN_KEY') || 'token';
const DEFAULT_SESSION_ID = 'auth:primary';

function setupPrimarySession() {
  const email =
    Cypress.env('signupEmail') ||
    Cypress.env('defaultEmail');

  const password =
    Cypress.env('signupPassword') ||
    Cypress.env('defaultPassword') ||
    'Password1!';

  Login.loginForSession(email, password);
}

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
    cy.window().should((w) => {
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
    cy.intercept('POST', '/api/login').as('apiLogin');
    this.fillCredentials(email, password);
    this.submitLogin();
    cy.wait('@apiLogin').its('response.statusCode').should('be.oneOf', [200, 201]);
    cy.window().should((w) => {
      const token = w.localStorage.getItem(TOKEN_KEY);
      expect(token, `localStorage "${TOKEN_KEY}" set`).to.be.a('string').and.match(/^ey/);
    });
  },

  ensureSession(email, password, sessionId = DEFAULT_SESSION_ID) {
    if (email) Cypress.env('signupEmail', email);
    if (password) Cypress.env('signupPassword', password);

    cy.session(
      sessionId,
      setupPrimarySession, // stable reference avoids "This session already exists…" errors
      { cacheAcrossSpecs: true }
    );
  },

  restoreSession(sessionId = DEFAULT_SESSION_ID) {
    cy.session(
      sessionId,
      setupPrimarySession,
      { cacheAcrossSpecs: true }
    );
  },

  getToken() {
    return cy.window().then((w) => w.localStorage.getItem(TOKEN_KEY));
  },

  logout() {
    cy.window({ log: false }).then((w) => {
      try { w.localStorage.removeItem(TOKEN_KEY); } catch {}
      try { w.sessionStorage.clear(); } catch {}
    });
    cy.clearCookies();
  },

  loginWithInvalidCredentials(email, password) {
    this.login(email, password);
    cy.get(LoginLocators.errorMessage)
      .should('be.visible')
      .and('contain.text', 'Invalid credentials');
  },
};

export default Login;
