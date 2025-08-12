import H from '../helpers/actions';
import { SidebarLocators as SEL } from './locators';

const Sidebar = {
  waitForSidebar: () => cy.get(SEL.container).should('be.visible'),

  clickLogo: () => H.clickLogo(),

  goToDashboard: () => {
    cy.contains('button', 'Dashboard').click();
    H.pathHas('/dashboard');
  },

  goToInvestments: () => {
    cy.contains('button', 'Add Investment').click();
    H.pathHas('/add-investment');
  },

  goToSavings: () => {
    cy.contains('button', 'Add Savings').click();
    H.pathHas('/savings');
  },

  goToSettings: () => {
    cy.contains('button', 'Settings').click();
    H.pathHas('/settings');
  },

  clickLogout: () => {
    cy.contains('button', 'Logout').click();
    H.pathEq('/');
  },

  assertDashboardActive:   () => H.pathHas('/dashboard'),
  assertInvestmentsActive: () => H.pathHas('/add-investment'),
  assertSavingsActive:     () => H.pathHas('/savings'),
  assertSettingsActive:    () => H.pathHas('/settings'),
  assertNoneActive:        () => H.pathEq('/'),
};

export default Sidebar;
