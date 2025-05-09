import {
  extractKeyValuesFromFormattedTerms,
  normalizeExtractedText,
} from '../utils/payment-terms';

export default class InvoiceEditPage {
  static visit = (invoiceId: string) => {
    const apiEndpoint = `${
      Cypress.env().REACT_APP_API_URL
    }/api/invoices/${invoiceId}`;

    cy.intercept('GET', apiEndpoint).as('getInvoiceDetails');
    cy.visit(`/invoices/details/${invoiceId}`, {failOnStatusCode: false});
    cy.wait('@getInvoiceDetails');
    cy.get('[data-testid="bottom-drawer"]')
      .find('button svg[data-testid="MoreVertIcon"]')
      .click();
    cy.contains('li', 'Edit').click();
  };

  static saveInvoice = () => {
    InvoiceEditPage.selectValidVatForAllItems();

    cy.get('button[type="submit"]').click();

    cy.intercept('PUT', `${Cypress.env().REACT_APP_API_URL}/api/invoices/*`).as(
      'updateInvoice',
    );

    cy.wait('@updateInvoice');

    cy.url().should('include', '/invoices/details');
  };

  static verifyPaymentTerms = (formattedTerms: string) => {
    // Extract the text content from the rendered PDF or text content area
    const expectedValues = extractKeyValuesFromFormattedTerms(formattedTerms);

    cy.get('div[class^="react-pdf__Page__textContent"]')
      .should('exist')
      .then(($textLayer) => {
        cy.wrap($textLayer).find('span').should('have.length.greaterThan', 0);
      })
      .wait(5000)
      .then(() => {
        cy.get('div[class^="react-pdf__Page__textContent"]')
          .invoke('text')
          .then((textContent) => {
            const cleanTextContent = normalizeExtractedText(textContent);

            // Verify that each expected value exists in the extracted content
            expectedValues.forEach((value) => {
              expect(cleanTextContent).to.include(value);
            });
          });
      });
  };

  static selectValidVatForAllItems = () => {
    cy.get(`[data-testid^="vat-dropdown-table-cell"]`).each(($cell) => {
      cy.wrap($cell).click({force: true});

      cy.get('ul[role="listbox"]', {timeout: 3000})
        .should('be.visible')
        .find('li')
        .first()
        .click();

      cy.get('ul[role="listbox"]').should('not.exist');
    });
  };

  static getPaymentTermsField = () =>
    cy.get('div[data-testid="payment-terms-rich-text-field"]');

  static openPaymentTermsDialog = () =>
    InvoiceEditPage.getPaymentTermsField()
      .find('svg[data-testid="TextSnippetIcon"]')
      .click();
}
