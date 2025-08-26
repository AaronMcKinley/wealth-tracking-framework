import { users } from '../../support/data/users';
import Helpers from '../../support/helpers/actions';
import Login from '../../support/login/actions';
import Savings from '../../support/savings/actions';
import Sidebar from '../../support/sidebar/actions';

const NAME = 'Emergency Fund';
const DEPOSIT = 200;
const PARTIAL_WITHDRAW = 50;

describe('Savings — deposit and withdraw flows', { tags: ['@regression', '@savings'] }, () => {
  beforeEach(() => {
    cy.session('validUser', () => {
      Login.loginForSession(users.validUser.email, users.validUser.password);
    });
  });

  it('adds savings via deposit', () => {
    Savings.interceptList({ name: NAME, balance: 0 }, 'list1');
    const post = Savings.interceptDepositAssert({ amount: DEPOSIT }, 'postDep');
    const after = Savings.interceptAfterList({ name: NAME, balance: DEPOSIT }, 'listAfterDep');

    Helpers.visit('/dashboard');
    Sidebar.waitForSidebar();
    Sidebar.goToSavings();
    cy.wait('@list1');

    Savings.depositFlow({ name: NAME, amount: DEPOSIT });
    cy.wait([post, after]);

    Savings.assertDashboardRow({ name: NAME, balanceText: `€${DEPOSIT.toFixed(2)}` });
  });

  it('prevents withdrawing more than available', () => {
    Savings.interceptList({ name: NAME, balance: DEPOSIT }, 'list2');

    Helpers.visit('/dashboard');
    Sidebar.waitForSidebar();
    Sidebar.goToSavings();
    cy.wait('@list2');

    Savings.withdrawFlow({ name: NAME, amount: DEPOSIT + 100 });
    Savings.expectOverdraftError(String(DEPOSIT));
    Savings.assertDashboardRow({ name: NAME, balanceText: `€${DEPOSIT.toFixed(2)}` });
  });

  it('withdraws part and reflects reduced balance', () => {
    Savings.interceptList({ name: NAME, balance: DEPOSIT }, 'list3');
    const postW = Savings.interceptWithdrawAssert({ amount: PARTIAL_WITHDRAW }, 'postW');
    const afterW = Savings.interceptAfterList(
      { name: NAME, balance: DEPOSIT - PARTIAL_WITHDRAW },
      'listAfterW',
    );

    Helpers.visit('/dashboard');
    Sidebar.waitForSidebar();
    Sidebar.goToSavings();
    cy.wait('@list3');

    Savings.withdrawFlow({ name: NAME, amount: PARTIAL_WITHDRAW });
    cy.wait([postW, afterW]);

    Savings.assertDashboardRow({
      name: NAME,
      balanceText: `€${(DEPOSIT - PARTIAL_WITHDRAW).toFixed(2)}`,
    });
  });
});
