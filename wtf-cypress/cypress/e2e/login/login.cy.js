import Login from '../../support/login/actions';
import { users } from '../../support/data/users';

const TOKEN_KEY = Cypress.env('TOKEN_KEY') || 'token';

describe('Authentication & Session', { tags: ['@regression', '@auth', '@smoke'] }, () => {
  it('redirects unauthenticated users to /login', { tags: ['@critical'] }, () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/dashboard', { failOnStatusCode: false });
    cy.location('pathname').should('eq', '/login');
  });

  it('logs in successfully', { tags: ['@critical'] }, () => {
    cy.session('validUser', () => {
      Login.loginSuccessfully(users.validUser.email, users.validUser.password);
    });
    cy.visit('/dashboard');
    cy.location('pathname').should('match', /(\/dashboard|\/)$/);
    cy.window().then((w) => {
      const token = w.localStorage.getItem(TOKEN_KEY);
      expect(token).to.be.a('string').and.match(/^ey/);
    });
  });

  it('accesses protected route when authenticated', () => {
    cy.session('validUser', () => {
      Login.loginSuccessfully(users.validUser.email, users.validUser.password);
    });
    cy.visit('/dashboard');
    cy.location('pathname').should('include', '/dashboard');
  });

  it('shows 404 for an invalid route when authenticated', () => {
    cy.session('validUser', () => {
      Login.loginSuccessfully(users.validUser.email, users.validUser.password);
    });
    cy.visit('/def-not-a-real-route', { failOnStatusCode: false });
    cy.contains(/(404|page not found)/i).should('be.visible');
    cy.window().then((w) => {
      expect(w.localStorage.getItem(TOKEN_KEY)).to.exist;
    });
  });
});
