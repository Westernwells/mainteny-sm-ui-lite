export const LANGUAGE_MAP = {
  EN: {
    English: 'English',
    Deutsche: 'Deutsche',
    Serbian: 'Serbian',
    Italian: 'Italian',
    Russian: 'Russian',
  },
  DE: {
    English: 'Englisch',
    Deutsche: 'Deutsche',
    Serbian: 'Serbian',
    Italian: 'Italian',
    Russian: 'Russisch',
  },
  SR: {
    English: 'Engleski jezik',
    Deutsche: 'Deutsche',
    Serbian: 'Serbian',
    Italian: 'Italian',
    Russian: 'Russian',
  },
  IT: {
    English: 'Inglese',
    Deutsche: 'Deutsche',
    Serbian: 'Serbian',
    Italian: 'Italian',
    Russian: 'Ruski',
  },
  RU: {
    English: 'Английский',
    Deutsche: 'Немецкий',
    Serbian: 'Сербия',
    Italian: 'Италия',
    Russian: 'Русский',
  },
};
export default class AppTopBarPage {
  static selectLanguage(languageText) {
    // Ensure spinners or overlays are gone before proceeding
    cy.get('[data-testid="spinner"]', {timeout: 10000}).should('not.exist');

    cy.get('body').then(($body) => {
      if ($body.find('#topBarSelectLanguageMenuList').length === 0) {
        cy.wait(700);
        cy.get('#topBarSelectLanguageButton', {timeout: 10000})
          .should('exist')
          .should('be.visible')
          .click({force: true});
      }
    });

    // Ensure the dropdown menu is visible
    cy.get('#topBarSelectLanguageMenuList')
      .should('exist')
      .should('be.visible')
      .as('languageMenu');

    cy.get('#topBarSelectLanguageButton')
      .invoke('text')
      .then((currentLang) => {
        if (!LANGUAGE_MAP[currentLang]) {
          throw new Error(`Unsupported language code detected: ${currentLang}`);
        }

        const translatedText = LANGUAGE_MAP[currentLang][languageText];

        if (!translatedText) {
          throw new Error(
            `Language option "${languageText}" is missing in the "${currentLang}" map.`,
          );
        }

        cy.get('@languageMenu')
          .find('li')
          .contains(translatedText)
          .should('exist')
          .should('be.visible')
          .click({force: true});
      });
  }
}
