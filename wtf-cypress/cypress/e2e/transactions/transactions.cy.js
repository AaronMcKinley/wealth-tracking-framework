import Login from '../../support/login/actions';
import { users } from '../../support/data/users';
import Transactions from '../../support/transactions/actions';

describe(
  'Transactions — SOL buy→sell half→profit in table',
  { tags: ['@regression', '@transactions', '@investments'] },
  () => {
    beforeEach(() => {
      Login.ensureSession(users.validUser.email, users.validUser.password, 'validUser:transactions');
    });

    it('adds SOL, sells half for a profit, then verifies realized P/L appears', () => {
      Transactions.setup.dashboardEmpty();
      Transactions.simple.buyAndSellHalfForProfit();
      Transactions.simple.openTransactions();
      Transactions.simple.expectProfitInTable();
    });
  }
);
