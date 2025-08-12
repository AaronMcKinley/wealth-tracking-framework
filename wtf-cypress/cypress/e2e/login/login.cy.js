import Login from '../../support/login/actions';
import { users } from '../../support/data/users';

describe('Authentication', { tags: ['@regression', '@auth'] }, () => {
  it('logs in successfully with valid credentials', () => {
    cy.allure().tag('smoke');
    cy.allure().severity('critical');
    cy.allure().story('User Authentication');
    cy.allure().link({ url: 'https://example.com/issues/C000001', name: 'C000001', type: 'issue' });

    Login.loginSuccessfully(users.validUser.email, users.validUser.password);
  });

  it('shows an error for invalid login', () => {
    cy.allure().tag('negative');
    cy.allure().severity('minor');
    cy.allure().story('User Authentication');
    cy.allure().link({ url: 'https://example.com/issues/C000002', name: 'C000002', type: 'issue' });

    Login.loginWithInvalidCredentials(users.invalidUser.email, users.invalidUser.password);
  });
});
