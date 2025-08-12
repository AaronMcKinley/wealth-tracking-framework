import H from '../../support/helpers/actions';
import Signup from '../../support/signup/actions';
import Login from '../../support/login/actions';
import Sidebar from '../../support/sidebar/actions';

const NAME = 'E2E Test User';
const EMAIL = 'e2e.signup@example.com';
const PW_BAD_NUM = 'Password!';
const PW_BAD_SYM = 'Password1';
const PW_GOOD = 'Password1!';

describe('Signup', { tags: ['@auth', '@signup', '@regression'] }, () => {
  beforeEach(() => H.resetState());

  it('homepage → signup → cancel → signup', () => {
    H.visit('/');
    Signup.openFromHome();
    H.pathHas('/signup');

    H.cancel();
    H.pathEq('/');

    Signup.openFromHome();
    H.pathHas('/signup');
  });

  it('rejects misformatted passwords', () => {
    H.visit('/signup');
    Signup.fill({ name: NAME, email: EMAIL, password: PW_BAD_NUM });
    H.submit(); H.pathHas('/signup'); H.expectFormError();

    Signup.fill({ name: NAME, email: EMAIL, password: PW_BAD_SYM });
    H.submit(); H.pathHas('/signup'); H.expectFormError();
  });

  it('creates an account and shows the name in Settings', () => {
    H.visit('/signup');
    Signup.fill({ name: NAME, email: EMAIL, password: PW_GOOD });
    H.submit();

    cy.location('pathname').then((p) => {
      if (p.includes('/login')) Login.loginSuccessfully(EMAIL, PW_GOOD);
    });

    H.visit('/dashboard');
    Sidebar.waitForSidebar();
    Sidebar.goToSettings();
    Sidebar.assertSettingsActive();
    cy.contains(NAME).should('be.visible');
  });
});
