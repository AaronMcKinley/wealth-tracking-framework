import { users } from '../../support/data/users';
import Helper from '../../support/helpers/actions';
import Login from '../../support/login/actions';

const TOKEN_KEY = Cypress.env('TOKEN_KEY') || 'token';
const email = Cypress.env('signupEmail') || users.validUser.email;
const password = Cypress.env('signupPassword') || users.validUser.password || 'Password1!';

describe('Authentication & Session', { tags: ['@regression', '@auth', '@smoke'] }, () => {
  it('redirects unauthenticated users to /login', { tags: ['@critical'] }, () => {
    Helper.resetState();
    Helper.visit('/dashboard');
    Helper.pathEq('/login');
  });

  describe('when authenticated', () => {
    before(() => {
      Login.ensureSession(email, password);
    });

    beforeEach(() => {
      Login.restoreSession();
    });

    it('logs in successfully', { tags: ['@critical'] }, () => {
      Helper.visit('/dashboard');
      cy.location('pathname').should('match', /(\/dashboard|\/)$/);
      cy.window().then((w) => {
        const token = w.localStorage.getItem(TOKEN_KEY);
        expect(token).to.be.a('string').and.match(/^ey/);
      });
    });

    it('accesses protected route when authenticated', () => {
      Helper.visit('/dashboard');
      Helper.pathHas('/dashboard');
    });

    it('shows 404 for an invalid route when authenticated', () => {
      Helper.visit('/def-not-a-real-route', { failOnStatusCode: false });
      cy.contains(/(404|page not found)/i).should('be.visible');
      cy.window().then((w) => {
        expect(w.localStorage.getItem(TOKEN_KEY)).to.exist;
      });
    });
  });
});
