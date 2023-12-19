const DE_LANG = {
  English: 'Englisch',
  Deutsche: 'Deutsche',
  Serbian: 'Serbian',
  Italian: 'Italian',
};

const SR_LANG = {
  English: 'Engleski jezik',
  Deutsche: 'Deutsche',
  Serbian: 'Serbian',
  Italian: 'Italian',
};

const IT_LANG = {
  English: 'Inglese',
  Deutsche: 'Deutsche',
  Serbian: 'Serbian',
  Italian: 'Italian',
};

export default class AppTopBarPage {
  static selectLanguage(languageText) {
    cy.get('#selectLanguageMenuList').should('not.exist');

    // Click the button to reveal the list
    cy.get('#selectLanguageButton').click();

    // Ensure the list is visible
    cy.get('#selectLanguageMenuList').should('be.visible');

    cy.get('#selectLanguageButton')
      .invoke('text')
      .then((text) => {
        if (text === 'EN') {
          cy.get('#selectLanguageMenuList li').contains(languageText).click();
        }

        if (text === 'DE') {
          cy.get('#selectLanguageMenuList li')
            .contains(DE_LANG[languageText])
            .click();
        }

        if (text === 'SR') {
          cy.get('#selectLanguageMenuList li')
            .contains(SR_LANG[languageText])
            .click();
        }

        if (text === 'IT') {
          cy.get('#selectLanguageMenuList li')
            .contains(IT_LANG[languageText])
            .click();
        }
      });
  }
  // Other methods as needed...
}
