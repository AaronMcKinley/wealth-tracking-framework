import Helpers from '../../support/helpers/actions';
import Signup from '../../support/signup/actions';
import SignupLocators from '../../support/signup/locators';
import Login from '../../support/login/actions';
import Sidebar from '../../support/sidebar/actions';

const NAME = 'E2E Test User';
const EMAIL_NEG = 'e2e.signup@example.com';
const PW_BAD_NUM = 'Password!';
const PW_BAD_SYM = 'Password1';
const PW_GOOD = 'Password1!';

describe('Signup', { tags: ['@auth', '@signup', '@regression'] }, () => {
  beforeEach(() => {
    Helpers.ensureLoggedOut();
  });

  it('homepage → signup → cancel → signup', () => {
    Helpers.visit('/');
    Signup.openFromHome();
    Helpers.pathHas('/signup');

    Signup.cancel();
    Helpers.pathEq('/');

    Signup.openFromHome();
    Helpers.pathHas('/signup');
  });

  it('rejects misformatted passwords and duplicate email', () => {
    Helpers.visit('/signup');
    Signup.fill({ name: NAME, email: EMAIL_NEG, password: PW_BAD_NUM });
    Helpers.submit();
    Helpers.pathHas('/signup');
    Helpers.expectFormError();

    Signup.fill({ name: NAME, email: EMAIL_NEG, password: PW_BAD_SYM });
    Helpers.submit();
    Helpers.pathHas('/signup');
    Helpers.expectFormError();

    cy.intercept('POST', '/api/signup').as('apiSignup');
    Signup.fill({ name: NAME, email: 'test@email.com', password: PW_GOOD });
    Helpers.submit();
    cy.wait('@apiSignup').its('response.statusCode').should('be.oneOf', [409, 400]);
    Helpers.pathHas('/signup');
    cy.contains(/email.*in use/i).should('exist');
  });

  it('creates an account, shows the name in Settings, then deletes the account', () => {
    const email = Helpers.genEmail('signup');
    Helpers.visit('/signup');
    Signup.fill({ name: NAME, email, password: PW_GOOD });
    Helpers.submit();
    cy.location('pathname', { timeout: 10000 }).then((p) => {
      if (!/^\/dashboard\/?$/.test(p)) {
        Login.loginSuccessfully(email, PW_GOOD);
      }
    });

    Helpers.visit('/dashboard');
    Sidebar.waitForSidebar();
    Sidebar.goToSettings();
    Sidebar.assertSettingsActive();
    cy.get(SignupLocators.settingsNameInput, { timeout: 10000 }).should('have.value', NAME);
    cy.get(SignupLocators.settingsEmailInput).should('have.value', email);
    cy.get(SignupLocators.settingsDeleteBtn).click();
    cy.get(SignupLocators.deleteConfirmModal, { timeout: 10000 }).should('be.visible');
    cy.get(SignupLocators.deleteConfirmInput).clear().type(email);
    cy.get(SignupLocators.deleteConfirmBtn).should('not.be.disabled').click();

    Helpers.pathEq('/');
    Login.loginWithInvalidCredentials(email, PW_GOOD);
  });
});
