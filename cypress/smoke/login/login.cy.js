import Login from '../../support/login/actions';
import { users } from '../../support/data/users';

describe('Authentication', { tags: ['@regression', '@auth'] }, () => {
  it('logs in successfully with valid credentials', () => {
    cy.allure().tag('smoke');
    cy.allure().link('C000001', { type: 'issue' });

    Login.loginSuccessfully(users.validUser.email, users.validUser.password);
  });

  it('shows an error for invalid login', () => {
    cy.allure().tag('negative');
    cy.allure().link('C000002', { type: 'issue' });
    Login.loginWithInvalidCredentials(users.invalidUser.email, users.invalidUser.password);
  });
});
