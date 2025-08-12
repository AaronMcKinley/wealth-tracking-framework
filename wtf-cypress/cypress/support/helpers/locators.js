export const HelperLocators = {
  // Header / logo
  header: 'header',
  logoLink: 'header a[href="/"]',
  logoImg: 'header img[alt="WTF Icon"]',

  // Shared links/buttons on home/auth pages
  homeSignUpLink: 'a[href="/signup"], a:contains("Sign Up"), button:contains("Sign Up")',
  homeLoginLink:  'a[href="/login"], a:contains("Login"), a:contains("Sign in"), button:contains("Login"), button:contains("Sign in")',
  cancelBtn:      'button:contains("Cancel"), a:contains("Cancel")',
  signInLink:     'a[href="/login"], a:contains("Sign in"), button:contains("Sign in")',

  // Generic form controls (more forgiving)
  nameInput:  '#name, input[name="name"], input[placeholder*="name" i]',
  emailInput: '#email, input[type="email"], input[name="email"]',
  passInputs: 'input[type="password"]',
  submitBtn:  'button[type="submit"]',
  errorMsg:   '[role="alert"], .error, .text-red-500, [data-error]',
};
