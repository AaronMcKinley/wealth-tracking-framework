import { SidebarLocators as SEL } from './locators';

const Sidebar = {
  waitForSidebar: () => cy.get(SEL.container).should('be.visible'),
  clickLogo: () => cy.get(SEL.logoLink).should('be.visible').click(),

  goToDashboard: () => {
    cy.contains('button', 'Dashboard').click();
    cy.location('pathname').should('include', '/dashboard');
  },

  goToInvestments: () => {
    cy.contains('button', 'Add Investment').click();
    cy.location('pathname').should('include', '/add-investment');
  },

  goToSavings: () => {
    cy.contains('button', 'Add Savings').click();
    cy.location('pathname').should('include', '/savings');
  },

  goToSettings: () => {
    cy.contains('button', 'Settings').click();
    cy.location('pathname').should('include', '/settings');
  },

  clickLogout: () => {
    cy.contains('button', 'Logout').click();
    cy.location('pathname').should('eq', '/');
  },

  assertDashboardActive: () => cy.location('pathname').should('include', '/dashboard'),
  assertInvestmentsActive: () => cy.location('pathname').should('include', '/add-investment'),
  assertSavingsActive:     () => cy.location('pathname').should('include', '/savings'),
  assertSettingsActive:    () => cy.location('pathname').should('include', '/settings'),

  assertNoneActive: () => cy.location('pathname').should('eq', '/'),
};

export default Sidebar;
