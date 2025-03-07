export default class LoginPage {
  static visitLoginPage = () => {
    cy.visit(`/login`, {
      failOnStatusCode: false,
    });
  };

  static login = () => {
    LoginPage.fillEmail('e2etest@mainteny.com');
    LoginPage.fillPassword('!!abc123');
    LoginPage.submitLoginForm();
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
    cy.get('[data-testid="spinner"]', {timeout: 10000}).should('not.exist');

    // Click the button to reveal the list
    cy.get('#selectLanguageButton').should('exist')
    .should('be.visible')
    .click({force: true});

    cy.get('body').then(($body) => {
      if ($body.find('#selectLanguageMenuList').length === 0) {
        cy.wait(700);
        cy.get('#selectLanguageButton').click({force: true});
      }
    });

       cy.get('#selectLanguageMenuList')
       .should('exist')
       .should('be.visible')
       .as('languageMenu');

       
    // Find and click on the li containing the word 'English'
    cy.get('#selectLanguageMenuList li').contains(languageText).click();
  }
}
