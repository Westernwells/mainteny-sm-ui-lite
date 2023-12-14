export default class LoginPage {
  static visitLoginPage = () => {
    cy.visit(`/login`, {
      failOnStatusCode: false,
    });
  };

  static fillEmail = (email) => {
    cy.get('#email').type(email);
  };

  static fillPassword = (password) => {
    cy.get('#password').type(password);
  };

  static submitLoginForm = () => {
    cy.get('button[type="submit"]').click();
  };

  static shouldSubmitBtnDisabled = (shouldBeDisabled = true) => {
    const button = cy.get('button[type="submit"]');
    if (shouldBeDisabled) {
      button.should('be.disabled');
    } else {
      button.should('not.be.disabled');
    }
  };

  static selectLanguage(languageText) {
    cy.get('#selectLanguageMenuList').should('not.exist');

    // Click the button to reveal the list
    cy.get('#selectLanguageButton').click();

    // Ensure the list is visible
    cy.get('#selectLanguageMenuList').should('be.visible');

    // Find and click on the li containing the word 'English'
    cy.get('#selectLanguageMenuList li').contains(languageText).click();
  }
  // Other methods as needed...
}
