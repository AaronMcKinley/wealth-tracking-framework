import Login from '../../support/login/actions';
import { users } from '../../support/data/users';
import Sidebar from '../../support/sidebar/actions';

describe('Routing & Layout — Sidebar', { tags: ['@regression', '@routing', '@ui', '@smoke'] }, () => {
  beforeEach(() => {
    cy.session('validUser', () => {
      Login.loginSuccessfully(users.validUser.email, users.validUser.password);
    });
  });

  it('navigates via sidebar and logs out', () => {
    cy.visit('/dashboard');
    Sidebar.waitForSidebar();

    Sidebar.goToInvestments();
    Sidebar.assertInvestmentsActive();

    Sidebar.goToSavings();
    Sidebar.assertSavingsActive();

    Sidebar.goToSettings();
    Sidebar.assertSettingsActive();

    Sidebar.goToDashboard();
    Sidebar.assertDashboardActive();

    Sidebar.clickLogout();
    Sidebar.assertNoneActive();
  });

  it('logo click returns to homepage', () => {
    cy.visit('/dashboard');
    Sidebar.waitForSidebar();

    Sidebar.clickLogo();
    Sidebar.assertNoneActive();
  });
});
