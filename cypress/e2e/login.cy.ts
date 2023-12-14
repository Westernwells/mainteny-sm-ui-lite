import LoginPage from '../pages/login.page';

describe('Login Page', () => {
  beforeEach(() => {
    LoginPage.visitLoginPage();
    LoginPage.selectLanguage('English');
  });

  it('shows incorrect email/password error', () => {
    LoginPage.visitLoginPage();
    LoginPage.fillEmail('e2etest@mainteny.com');
    LoginPage.fillPassword('12345678');
    LoginPage.submitLoginForm();

    cy.contains('Email or password entered is incorrect');
  });

  it('navigate to dashboard after login', () => {
    LoginPage.fillEmail('e2etest@mainteny.com');
    LoginPage.fillPassword('!!abc123');
    LoginPage.submitLoginForm();

    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });

  it('should disable the button when email or password is empty', () => {
    LoginPage.shouldSubmitBtnDisabled(true);

    LoginPage.fillEmail('e2etest@mainteny.com');

    // Now, the button should still be disabled as the password field is empty
    LoginPage.shouldSubmitBtnDisabled(true);

    LoginPage.fillPassword('testpassword');

    // Now, the button should be enabled as both email and password fields have values
    LoginPage.shouldSubmitBtnDisabled(false);
  });
});
