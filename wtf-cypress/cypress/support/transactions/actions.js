import Login from '../../support/login/actions';
import { users } from '../../support/data/users';

const TICKER = 'SOL';
const BUY_QTY = 2;
const BUY_PRICE = 170.0;
const SELL_QTY = 1;
const SELL_PRICE = 175.0;
const round2 = (n) => Number(n.toFixed(2));
const EXPECTED_PL = round2((SELL_PRICE - BUY_PRICE) * SELL_QTY);

describe(
  'Transactions — SOL buy→sell half→profit in table',
  { tags: ['@regression', '@transactions', '@investments'] },
  () => {
    beforeEach(() => {
      Login.ensureSession(users.validUser.email, users.validUser.password, 'validUser:transactions');
    });

    it('adds SOL, sells half for a profit, then verifies realized P/L appears', () => {
      cy.request({ method: 'DELETE', url: `/api/transactions/${TICKER}`, failOnStatusCode: false });
      cy.request('POST', '/api/investments', {
        name: TICKER,
        amount: BUY_QTY,
        total_value: round2(BUY_QTY * BUY_PRICE),
      });
      cy.request('POST', '/api/investments', {
        name: TICKER,
        amount: -SELL_QTY,
        total_value: round2(SELL_QTY * SELL_PRICE),
      });
      cy.visit(`/transactions/${TICKER}`);
      cy.get('h1').should('contain.text', `${TICKER} Transactions`);
      cy.get('table tbody tr').should('have.length.at.least', 2);
      const expected = EXPECTED_PL.toFixed(2);
      cy.get('table tbody tr')
        .contains('td', /^sell$/i)
        .parent()
        .within(() => {
          cy.get('td')
            .last()
            .invoke('text')
            .then((t) => {
              const numeric = t.replace(/[^\d.-]/g, '');
              expect(numeric).to.eq(expected);
            });
        });
    });
  }
);
