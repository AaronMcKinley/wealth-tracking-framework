import H from '../../support/helpers/actions';
import Signup from '../../support/signup/actions';
import Login from '../../support/login/actions';
import Sidebar from '../../support/sidebar/actions';

const NAME = 'E2E Test User';
const EMAIL_NEG = 'e2e.signup@example.com';
const PW_BAD_NUM = 'Password!';
const PW_BAD_SYM = 'Password1';
const PW_GOOD = 'Password1!';

describe('Signup', { tags: ['@auth', '@signup', '@regression'] }, () => {
  beforeEach(() => H.resetState());

  it('homepage → signup → cancel → signup', () => {
    H.visit('/');
    Signup.openFromHome();
    H.pathHas('/signup');

    Signup.cancel();
    H.pathEq('/');

    Signup.openFromHome();
    H.pathHas('/signup');
  });

  it('rejects misformatted passwords', () => {
    H.visit('/signup');
    Signup.fill({ name: NAME, email: EMAIL_NEG, password: PW_BAD_NUM });
    H.submit(); H.pathHas('/signup'); H.expectFormError();

    Signup.fill({ name: NAME, email: EMAIL_NEG, password: PW_BAD_SYM });
    H.submit(); H.pathHas('/signup'); H.expectFormError();
  });

  it('creates an account, shows the name in Settings, then deletes the account', () => {
    const email = H.genEmail('signup');
    H.visit('/signup');
    Signup.fill({ name: NAME, email, password: PW_GOOD });
    H.submit();
    cy.location('pathname', { timeout: 10000 }).then((p) => {
      if (p.includes('/login')) {
        Login.loginSuccessfully(email, PW_GOOD);
      }
    });

    H.visit('/dashboard');
    Sidebar.waitForSidebar();
    Sidebar.goToSettings();
    Sidebar.assertSettingsActive();
    cy.contains(NAME).should('be.visible');
    cy.get('[data-testid="settings-email"]').should('have.value', email);
    cy.get('[data-testid="settings-delete"]').click();
    cy.get('[role="dialog"][aria-modal="true"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="confirm-delete-input"]').clear().type(email);
    cy.get('[data-testid="confirm-delete"]').should('not.be.disabled').click();

    H.pathEq('/');
    Login.loginWithInvalidCredentials(email, PW_GOOD);
  });
});
