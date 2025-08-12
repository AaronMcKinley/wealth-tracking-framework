const LoginLocators = {
  emailInput: 'input[type="email"], input[name="email"], #email',
  passwordInput: 'input[type="password"], input[name="password"], #password',
  submitButton: 'button[type="submit"], button:contains("Login"), button:contains("Sign in"), #submit',
  errorMessage: '[role="alert"], .error, .text-red-500, [data-error]',
};
export default LoginLocators;
