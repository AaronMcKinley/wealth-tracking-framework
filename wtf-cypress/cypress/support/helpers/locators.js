const HelperLocators = {
  header: 'header',
  logoLink: 'header a[href="/"]',
  logoImg: 'header img[alt="WTF Icon"]',
  nameInput:  '#name, input[name="name"], input[placeholder*="name" i]',
  emailInput: '#email, input[type="email"], input[name="email"]',
  passInputs: 'input[type="password"]',
  submitBtn:  'button[type="submit"]',
  errorMsg:   '[role="alert"], .error, .text-red-500, [data-error]',
  successMsg: '[role="status"], .toast, .text-center.mt-2, [data-testid="settings-message"]',
  dialog: '[role="dialog"], .modal, .fixed.inset-0',
  dialogInput: 'input[type="text"], input[type="email"]',
  dialogConfirmBtn: '.btn-primary, [data-testid="confirm"], button:contains("Confirm")',
  dialogCancelBtn: '.btn-negative, [data-testid="cancel"], button:contains("Cancel")',
};
export default HelperLocators;
