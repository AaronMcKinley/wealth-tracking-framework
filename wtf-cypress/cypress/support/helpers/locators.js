export const HelperLocators = {
  // Shell / header
  header: 'header',
  logoLink: 'header a[href="/"]',
  logoImg: 'header img[alt="WTF Icon"]',

  nameInput:  'input[name="name"], input[placeholder*="name" i]',
  emailInput: 'input[type="email"], input[name="email"]',
  passInputs: 'input[type="password"]',
  submitBtn:  'button[type="submit"]',
  cancelBtn:  'button:contains("Cancel"), a:contains("Cancel")',
  errorMsg:   '[role="alert"], .error, .text-red-500, [data-error]',
};
