export const SignupLocators = {
  homeSignUpLink: 'a[href="/signup"], a:contains("Sign Up"), button:contains("Sign Up")',
  homeLoginLink:  'a[href="/login"], a:contains("Login"), a:contains("Sign in"), button:contains("Login"), button:contains("Sign in")',
  cancelButton:   'button:contains("Cancel"), a:contains("Cancel")',
  signInLink:     'a[href="/login"], a:contains("Sign in"), button:contains("Sign in")',
  settingsEmailInput: '[data-testid="settings-email"]',
  settingsDeleteBtn:  '[data-testid="settings-delete"]',
  deleteConfirmModal: '[role="dialog"][aria-modal="true"]',
  deleteConfirmInput: '[data-testid="confirm-delete-input"]',
  deleteConfirmBtn:   '[data-testid="confirm-delete"]',
};
export default SignupLocators;
