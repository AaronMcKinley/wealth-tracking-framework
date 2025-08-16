// cypress/e2e/transactions/transactions.cy.js
import Login from '../../support/login/actions';
import { users } from '../../support/data/users';
import Transactions from '../../support/transactions/actions';

const TICKER = 'SOL';
const BUY_QTY = 2;
const BUY_PRICE = 170.0;
const SELL_QTY = 1;
const SELL_PRICE = 175.0;
const EXPECTED_PL = Number(((SELL_PRICE - BUY_PRICE) * SELL_QTY).toFixed(2));

describe('Transactions — SOL buy→sell half→profit in table', { tags: ['@regression', '@transactions', '@investments'] }, () => {
  beforeEach(() => {
    Login.ensureSession(users.validUser.email, users.validUser.password, 'validUser:transactions');
  });

  it('clicks SOL on dashboard to open its transactions and verifies realized P/L', () => {
    Transactions.stubDashboardHolding(TICKER, BUY_QTY, BUY_PRICE);
    Transactions.stubTransactions(TICKER, BUY_QTY, BUY_PRICE, SELL_QTY, SELL_PRICE);
    Transactions.openDashboardAndClickAsset(TICKER);
    cy.wait('@getTx');
    Transactions.assertProfitForSellRow(EXPECTED_PL);
  });
});
