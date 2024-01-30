import { InvoiceStatusView } from '../../src/models/invoice';

export default class InvoicesPage {
  static visit = () => {
    cy.visit('/invoices', {
      failOnStatusCode: false
    })
  };

  static filterInvoicesListByStatus = (status: InvoiceStatusView) => {
    cy.get('div[role="button"][id="Status"]').click();
    cy.get('ul[role="listbox"] li').contains(status).click();
  }

  static openSendInvoiceModal = () => {
    cy.get('span[aria-label="Send"] button:last').click({ force: true }); 
  };

  static openPaymentModal = () => {
    cy.get('svg[data-testid="PaymentsIcon"]').first().parent('button[aria-label="Payment"]').click();
  }

  static markInvoiceAsPaid = () => {
    cy.get('input[name="markAsPaid"]').click()
  }

  static openSendInvoiceModalByInvoiceNumber = (invoiceNumber: string) => {
    cy.contains('div[data-field="NUMBER"]', invoiceNumber)
      .parent()
      .find('div[data-field="actions"] span[aria-label="Send"] button')
      .scrollIntoView()
      .should('be.visible')
      .click();
  }

  static fillInvoiceDetails = (invoice: any) => {
    cy.wait(1500);
    cy.get('input[name="email"]').clear().type(invoice.recipientEmail, { force: true });
    cy.get('input[name="subject"]').clear().type(invoice.subject, { force: true });
    cy.get('textarea[name="content"]').clear().type(invoice.text, { force: true });
  };

  static sendInvoice = () => {
    cy.contains('button', 'Send email').click();
  };
}
