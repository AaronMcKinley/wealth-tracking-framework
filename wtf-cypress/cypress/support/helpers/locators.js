export const HelperLocators = {
  header: 'header',
  logoLink: 'header a[href="/"]',
  logoImg: 'header img[alt="WTF Icon"]',
  nameInput:  '#name, input[name="name"], input[placeholder*="name" i]',
  emailInput: '#email, input[type="email"], input[name="email"]',
  passInputs: 'input[type="password"]',
  submitBtn:  'button[type="submit"]',
  errorMsg:   '[role="alert"], .error, .text-red-500, [data-error]',
  successMsg: '[role="status"], .toast, .text-center.mt-2, [data-testid="settings-message"]',
};
