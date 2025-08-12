import Login from '../../support/login/actions';
import { users } from '../../support/data/users';
import Sidebar from '../../support/sidebar/actions';

describe('Routing & Layout — Sidebar navigation', { tags: ['@regression', '@routing', '@ui', '@smoke'] }, () => {
  before(() => {
    cy.session('validUser', () => {
      Login.loginSuccessfully(users.validUser.email, users.validUser.password);
    });
  });

  beforeEach(() => {
    cy.session('validUser');
  });

  it('activates Dashboard on /dashboard', () => {
    cy.visit('/dashboard');
    Sidebar.assertDashboardActive();
  });

  it('navigates to Investments and reflects active state', () => {
    cy.visit('/dashboard');
    Sidebar.goToInvestments();
    Sidebar.assertInvestmentsActive();
  });

  it('navigates to Transactions and reflects active state', () => {
    cy.visit('/dashboard');
    Sidebar.goToTransactions();
    Sidebar.assertTransactionsActive();
  });

  it('logo click returns to homepage and no sidebar item is active', () => {
    cy.visit('/transactions');
    Sidebar.clickLogo();
    cy.location('pathname').should('eq', '/');
    Sidebar.assertNoneActive();
  });
});
