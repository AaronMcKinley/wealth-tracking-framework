import Login from '../../support/login/actions';
import { users } from '../../support/data/users';
import Transactions from '../../support/transactions/actions';

describe('Transactions — SOL buy→sell→P&L', { tags: ['@regression', '@transactions', '@investments'] }, () => {
  beforeEach(() => {
    cy.session('validUser', () => {
      Login.loginForSession(users.validUser.email, users.validUser.password);
    });
  });

  it('Create an investment sell part and then verifies realized P/L on the transactions page', () => {
    Transactions.setup.dashboardEmpty();
    Transactions.addInvestment.openAndSelect();
    Transactions.addInvestment.fillQtyAndWireNetwork();
    Transactions.addInvestment.confirmAndReturn();
    Transactions.sellInvestment.openAndPrepare();
    Transactions.sellInvestment.fillQtyAndWireNetwork();
    Transactions.sellInvestment.confirmAndReturn();
    Transactions.navigateAndAssert.openTransactionsFromDashboard();
    Transactions.navigateAndAssert.verifyRealizedPL();
  });
});
