/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
      fillRichTextField(field: string, value: string): Chainable<void>;
      clearRichTextField(field: string): Chainable<void>;
      waitForSpinnerToDisappear(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', () => {
  const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
  cy.visit('/login', {failOnStatusCode: false});
  cy.intercept('POST', loginURL).as('loginApi');
  cy.get('#email').type('e2etest@mainteny.com');
  cy.get('#password').type('!!abc123', {log: false});
  cy.get('button[type="submit"]').click();
  cy.wait('@loginApi').then(() => {
    cy.url().should('not.include', '/login');
    cy.get('#topBarSelectLanguageButton', { timeout: 10000 }).should('exist');
  });
});

Cypress.Commands.add('fillRichTextField', (field: string, value: string) => {
  cy.contains('legend', field)
    .parents('fieldset')
    .within(() => {
      cy.get('div[contenteditable="true"]')
        .focus()
        .click()
        .wait(1000)
        .realType(value);
    });
});

Cypress.Commands.add('clearRichTextField', (field: string) => {
  cy.contains('legend', field)
    .parents('fieldset')
    .within(() => {
      cy.get('div[contenteditable="true"]')
        .focus()
        .click()
        .wait(1000)
        .realClick({clickCount: 3})
        .realPress('Backspace');
    });
});

Cypress.Commands.add('waitForSpinnerToDisappear', () => {
  cy.get('span[role="progressbar"]').should('not.exist');
});

// hack for cypress typescript issues
export {};
