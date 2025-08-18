import H from '../helpers/actions';
import SL from './locators';

const Signup = {
  openFromHome: () => cy.get(SL.homeSignUpLink).first().click(),
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
  cancel: () => cy.get(SL.cancelButton).first().click(),
  clickSignIn: () => cy.get(SL.signInLink).first().click(),
  expectOnSignup: () => H.pathHas('/signup'),
  expectOnLogin: () => H.pathHas('/login'),
  expectOnHome: () => H.pathEq('/'),
  expectValidationError: () => H.expectFormError(),
};

export default Signup;
