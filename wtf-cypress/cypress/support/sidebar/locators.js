export const SidebarLocators = {
  logo: '[data-testid="app-logo"]',
  dashboard: '[data-testid="nav-dashboard"]',
  investments: '[data-testid="nav-investments"]',
  transactions: '[data-testid="nav-transactions"]',
  logout: '[data-testid="nav-logout"]',

  dashboardActive: '[data-testid="nav-dashboard"][aria-current="page"], [data-testid="nav-dashboard"].active',
  investmentsActive: '[data-testid="nav-investments"][aria-current="page"], [data-testid="nav-investments"].active',
  transactionsActive: '[data-testid="nav-transactions"][aria-current="page"], [data-testid="nav-transactions"].active',

  dashboardInactive: '[data-testid="nav-dashboard"]:not([aria-current="page"]):not(.active)',
  investmentsInactive: '[data-testid="nav-investments"]:not([aria-current="page"]):not(.active)',
  transactionsInactive: '[data-testid="nav-transactions"]:not([aria-current="page"]):not(.active)',
};
