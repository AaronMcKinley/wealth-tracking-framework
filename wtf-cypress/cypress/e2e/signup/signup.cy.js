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
  beforeEach(() => {
    H.ensureLoggedOut();
  });

  it('homepage → signup → cancel → signup', () => {
    H.visit('/');
    Signup.openFromHome();
    H.pathHas('/signup');

    Signup.cancel();
    H.pathEq('/');

    Signup.openFromHome();
    H.pathHas('/signup');
  });

  it('rejects misformatted passwords and duplicate email', () => {
    H.visit('/signup');
    Signup.fill({ name: NAME, email: EMAIL_NEG, password: PW_BAD_NUM });
    H.submit();
    H.pathHas('/signup');
    H.expectFormError();

    Signup.fill({ name: NAME, email: EMAIL_NEG, password: PW_BAD_SYM });
    H.submit();
    H.pathHas('/signup');
    H.expectFormError();

    cy.intercept('POST', '/api/signup').as('apiSignup');
    Signup.fill({ name: NAME, email: 'test@email.com', password: PW_GOOD });
    H.submit();
    cy.wait('@apiSignup').its('response.statusCode').should('be.oneOf', [409, 400]);
    H.pathHas('/signup');
    cy.contains(/email.*in use/i).should('exist');
  });

  it('creates an account, shows the name in Settings, then deletes the account', () => {
    const email = H.genEmail('signup');
    H.visit('/signup');
    Signup.fill({ name: NAME, email, password: PW_GOOD });
    H.submit();
    cy.location('pathname', { timeout: 10000 }).then((p) => {
      if (!/^\/dashboard\/?$/.test(p)) {
        Login.loginSuccessfully(email, PW_GOOD);
      }
    });

    H.visit('/dashboard');
    Sidebar.waitForSidebar();
    Sidebar.goToSettings();
    Sidebar.assertSettingsActive();
    cy.get(Signup.settingsNameInput, { timeout: 10000 }).should('have.value', NAME);
    cy.get(Signup.settingsEmailInput).should('have.value', email);
    cy.get(Signup.settingsEmailInput).should('have.value', email);
    cy.get(Signup.settingsDeleteBtn).click();
    cy.get(Signup.deleteConfirmModal, { timeout: 10000 }).should('be.visible');
    cy.get(Signup.deleteConfirmInput).clear().type(email);
    cy.get(Signup.deleteConfirmBtn).should('not.be.disabled').click();

    H.pathEq('/');
    Login.loginWithInvalidCredentials(email, PW_GOOD);
  });
});
