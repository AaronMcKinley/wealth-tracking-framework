import Login from '../../support/login/actions';
import { users } from '../../support/data/users';
import Transactions from '../../support/transactions/actions';

describe('Transactions — navigate to SOL by clicking in Dashboard table', { tags: ['@transactions'] }, () => {
  beforeEach(() => {
    Login.ensureSession(users.validUser.email, users.validUser.password, 'validUser:transactions');
  });

  it('goes to SOL transactions via dashboard click with clear steps', () => {
    Transactions.openDashboard();
    Transactions.waitForHoldingsTable();
    Transactions.focusAssetRow('SOL');
    Transactions.clickAssetTransactionsLinkOrRow();
    Transactions.assertUrlForAsset('SOL');
    Transactions.assertTransactionsPageLoaded('SOL');
  });
});
