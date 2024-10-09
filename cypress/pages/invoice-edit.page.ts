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
    cy.visit(`/invoices/details/${invoiceId}/edit`, {failOnStatusCode: false});
    cy.wait('@getInvoiceDetails');
  };

  static saveInvoice = () => {
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

    cy.get('div[class^="react-pdf__Page__textContent"]', {timeout: 15000})
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
}
