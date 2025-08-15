import Helpers from '../../support/helpers/actions';
import Login from '../../support/login/actions';

const TOKEN_KEY = Cypress.env('TOKEN_KEY') || 'token';
const withCreatedUser = (cb) => cy.fixture('created-user.json').then(cb);

describe('Authentication & Session', { tags: ['@regression', '@auth', '@smoke'] }, () => {
  it('redirects unauthenticated users to /login', { tags: ['@critical'] }, () => {
    Helpers.resetState();
    Helpers.visit('/dashboard');
    Helpers.pathEq('/login');
  });

  it('logs in successfully', { tags: ['@critical'] }, () => {
    withCreatedUser(({ email, password }) => {
      cy.session(`signup:${email}`, () => {
        Login.loginForSession(email, password);
      });
      Helpers.visit('/dashboard');
      cy.location('pathname').should('match', /(\/dashboard|\/)$/);
      cy.window().then((w) => {
        const token = w.localStorage.getItem(TOKEN_KEY);
        expect(token).to.be.a('string').and.match(/^ey/);
      });
    });
  });

  it('accesses protected route when authenticated', () => {
    withCreatedUser(({ email, password }) => {
      cy.session(`signup:${email}`, () => Login.loginForSession(email, password));
      Helpers.visit('/dashboard');
      Helpers.pathHas('/dashboard');
    });
  });

  it('shows 404 for an invalid route when authenticated', () => {
    withCreatedUser(({ email, password }) => {
      cy.session(`signup:${email}`, () => Login.loginForSession(email, password));
      Helpers.visit('/def-not-a-real-route', { failOnStatusCode: false });
      cy.contains(/(404|page not found)/i).should('be.visible');
      cy.window().then((w) => {
        expect(w.localStorage.getItem(TOKEN_KEY)).to.exist;
      });
    });
  });
});
