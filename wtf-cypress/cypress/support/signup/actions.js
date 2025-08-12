import H from '../helpers/actions';

const Signup = {
  openFromHome: () => H.clickHomeSignUp(),
  visit: () => H.visit('/signup'),
  fill: ({ name, email, password, confirm }) => {
    if (name != null) H.typeName(name);
    if (email != null) H.typeEmail(email);
    if (password != null) {
      H.typePassword(0, password);
      H.typePassword(1, confirm ?? password);
    }
  },

  submit: () => H.submit(),
  cancel: () => H.cancel(),
  clickSignIn: () => H.clickSignInLink(),
  expectOnSignup: () => H.pathHas('/signup'),
  expectOnLogin:  () => H.pathHas('/login'),
  expectOnHome:   () => H.pathEq('/'),
  expectValidationError: () => H.expectFormError(),
};

export default Signup;
