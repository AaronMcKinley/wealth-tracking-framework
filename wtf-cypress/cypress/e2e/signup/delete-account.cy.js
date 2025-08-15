import Helper from '../../support/helpers/actions';
import Login from '../../support/login/actions';
import Sidebar from '../../support/sidebar/actions';
import Signup from '../../support/signup/actions';
import SignupLocators from '../../support/signup/locators';

const NAME = 'E2E Delete Test';
const PW = 'Password1!';

describe('Account Deletion', { tags: ['@auth', '@account', '@regression'] }, () => {
  it('creates a fresh user then deletes it from Settings', () => {
    const email = Helper.genEmail('delete');
    Helper.ensureLoggedOut();
    Helper.visit('/signup');
    Signup.fill({ name: NAME, email, password: PW });
    Helper.submit();
    cy.location('pathname', { timeout: 10000 }).then((p) => {
      if (!/^\/dashboard\/?$/.test(p)) {
        Login.loginSuccessfully(email, PW);
      }
    });

    Helper.visit('/dashboard');
    Sidebar.waitForSidebar();
    Sidebar.goToSettings();
    Sidebar.assertSettingsActive();

    cy.get(SignupLocators.settingsEmailInput, { timeout: 10000 }).should('have.value', email);
    cy.get(SignupLocators.settingsDeleteBtn).click();
    cy.get(SignupLocators.deleteConfirmModal, { timeout: 10000 }).should('be.visible');
    cy.get(SignupLocators.deleteConfirmInput).clear().type(email);
    cy.get(SignupLocators.deleteConfirmBtn).should('not.be.disabled').click();

    Helper.pathEq('/');
    Login.loginWithInvalidCredentials(email, PW);
  });
});
