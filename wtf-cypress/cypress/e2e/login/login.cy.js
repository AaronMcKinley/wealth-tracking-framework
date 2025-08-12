import Login from '../../support/login/actions';
import { users } from '../../support/data/users';

const TOKEN_KEY = Cypress.env('TOKEN_KEY') || 'token';

describe('Authentication & Session', { tags: ['@regression', '@auth', '@smoke'] }, () => {
  it('redirects to /login when unauthenticated, logs in, then shows 404 for invalid route when authenticated', { tags: ['@critical'] }, () => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit('/dashboard', { failOnStatusCode: false });
    cy.location('pathname').should('eq', '/login');

    Login.loginSuccessfully(users.validUser.email, users.validUser.password);

    cy.location('pathname').should('match', /(\/dashboard|\/)$/);

    cy.window().then((w) => {
      const token = w.localStorage.getItem(TOKEN_KEY);
      expect(token, `localStorage "${TOKEN_KEY}" set`).to.be.a('string').and.match(/^ey/);
    });

    cy.visit('/dashboard');
    cy.location('pathname').should('include', '/dashboard');

    cy.visit('/def-not-a-real-route', { failOnStatusCode: false });
    cy.contains(/(404|page not found)/i).should('be.visible');

    cy.window().then((w) => {
      expect(w.localStorage.getItem(TOKEN_KEY)).to.exist;
    });
  });
});
