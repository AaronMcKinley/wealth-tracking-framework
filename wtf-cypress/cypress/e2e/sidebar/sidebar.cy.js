import Helper from '../../support/helpers/actions';
import Login from '../../support/login/actions';
import { users } from '../../support/data/users';
import Sidebar from '../../support/sidebar/actions';

describe('Routing & Layout — Sidebar', { tags: ['@regression', '@routing', '@ui', '@smoke'] }, () => {
  beforeEach(() => {
    cy.session('validUser', () => {
      Login.loginForSession(users.validUser.email, users.validUser.password);
    });
  });

  it('navigates via sidebar and logs out', () => {
    Helper.visit('/dashboard');
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
    Helper.pathEq('/');
    Sidebar.assertNoneActive();
  });

  it('logo click returns to homepage', () => {
    Helper.visit('/dashboard');
    Sidebar.waitForSidebar();

    Sidebar.clickLogo();
    Helper.pathEq('/');
    Sidebar.assertNoneActive();
  });
});
