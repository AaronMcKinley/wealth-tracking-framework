import { SidebarLocators as SEL } from './locators';

const Sidebar = {
  clickLogo: () => cy.get(SEL.logo).click(),
  clickLogout: () => cy.get(SEL.logout).click(),

  goToDashboard: () => {
    cy.get(SEL.dashboard).click();
    cy.location('pathname').should('include', '/dashboard');
  },

  goToInvestments: () => {
    cy.get(SEL.investments).click();
    cy.location('pathname').should('include', '/investments');
  },

  goToTransactions: () => {
    cy.get(SEL.transactions).click();
    cy.location('pathname').should('include', '/transactions');
  },

  assertDashboardActive: () => {
    cy.get(SEL.dashboardActive).should('exist');
    cy.get(SEL.investmentsInactive).should('exist');
    cy.get(SEL.transactionsInactive).should('exist');
  },

  assertInvestmentsActive: () => {
    cy.get(SEL.investmentsActive).should('exist');
    cy.get(SEL.dashboardInactive).should('exist');
    cy.get(SEL.transactionsInactive).should('exist');
  },

  assertTransactionsActive: () => {
    cy.get(SEL.transactionsActive).should('exist');
    cy.get(SEL.dashboardInactive).should('exist');
    cy.get(SEL.investmentsInactive).should('exist');
  },

  assertNoneActive: () => {
    cy.get(SEL.dashboardInactive).should('exist');
    cy.get(SEL.investmentsInactive).should('exist');
    cy.get(SEL.transactionsInactive).should('exist');
  },
};

export default Sidebar;
