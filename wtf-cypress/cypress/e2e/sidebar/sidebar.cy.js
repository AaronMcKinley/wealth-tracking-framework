import Login from '../../support/login/actions';
import { users } from '../../support/data/users';
import Sidebar from '../../support/sidebar/actions';

describe('Routing & Layout — Sidebar', { tags: ['@regression', '@routing', '@ui', '@smoke'] }, () => {
  beforeEach(() => {
    cy.session('validUser', () => {
      Login.loginSuccessfully(users.validUser.email, users.validUser.password);
    });
  });

  it('navigates via sidebar, reflects active state, and logs out', () => {
    cy.visit('/dashboard');
    Sidebar.assertDashboardActive();

    Sidebar.goToInvestments();
    Sidebar.assertInvestmentsActive();

    Sidebar.goToTransactions();
    Sidebar.assertTransactionsActive();

    Sidebar.goToDashboard();
    Sidebar.assertDashboardActive();

    Sidebar.clickLogout();
    cy.location('pathname').should('eq', '/');
  });

  it('logo click returns to homepage and no sidebar item is active', () => {
    cy.visit('/transactions');
    Sidebar.clickLogo();
    cy.location('pathname').should('eq', '/');
    Sidebar.assertNoneActive();
  });
});
