const SavingsLocators = {
  dashboard: {
    addBtnScope: 'a,button',
  },
  form: {
    name: 'input[name="name"], input#savings-name, [data-testid="savings-name"]',
    target:
      'input[name="target_amount"], input[name="target"], input#savings-target, [data-testid="savings-target"]',
    amount: 'input[name="amount"], input#amount, [data-testid="savings-amount"]',
    submitBtn: 'button[type="submit"], [data-testid="savings-submit"], .btn-primary',
  },
  modal: {
    root: '[role="dialog"], .modal, .swal2-popup',
    confirmBtn: '[data-testid="confirm"], .modal .confirm, .swal2-confirm, button.btn-primary',
  },
  errors: {
    msg: '[role="alert"], .error, .text-red-500, .toast-error',
  },
};

export default SavingsLocators;
