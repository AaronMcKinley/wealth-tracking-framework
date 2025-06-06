import LoginLocators from './locators';

const Login = {
  visitLoginPage() {
    cy.visit('/login');
  },

  fillCredentials(email, password) {
    cy.get(LoginLocators.emailInput).clear().type(email);
    cy.get(LoginLocators.passwordInput).clear().type(password);
  },

  submitLogin() {
    cy.get(LoginLocators.submitButton).click();
  },

  verifySuccessfulLogin() {
    cy.url().should('include', '/dashboard');
    cy.get('header').should('contain.text', 'Wealth Tracking Framework');
  },

  verifyLoginError(message = 'Invalid credentials') {
    cy.get(LoginLocators.errorMessage)
      .should('be.visible')
      .and('contain.text', message);
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

  loginWithInvalidCredentials(email, password) {
    this.login(email, password);
    this.verifyLoginError();
  }
};

export default Login;
