import { users } from '../../support/data/users';
import Helper from '../../support/helpers/actions';
import Login from '../../support/login/actions';
import Sidebar from '../../support/sidebar/actions';

const email = Cypress.env('signupEmail') || users.validUser.email;
const password = Cypress.env('signupPassword') || users.validUser.password || 'Password1!';

describe(
  'Routing & Layout — Sidebar',
  { tags: ['@regression', '@routing', '@ui', '@smoke'] },
  () => {
    before(() => {
      Login.ensureSession(email, password);
    });

    beforeEach(() => {
      Login.restoreSession();
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
  },
);
