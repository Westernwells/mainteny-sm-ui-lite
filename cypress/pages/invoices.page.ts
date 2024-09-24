import {InvoiceStatusView} from '../../src/models/invoice';

export default class InvoicesPage {
  static visit = () => {
    cy.get('ul > div[role="button"][data-testid="invoices-nav-item"]').click();
  };

  static filterInvoicesListByStatus = (status: InvoiceStatusView) => {
    cy.get('div[role="combobox"][aria-labelledby="Status"]').click();
    cy.get('li[role="option"]').contains(status).click();
  };

  static openSendInvoiceModal = () => {
    cy.get('span[aria-label="Send"] button:last').click({force: true});
  };

  static openPaymentModal = () => {
    cy.get('svg[data-testid="PaymentsIcon"]')
      .first()
      .parent('button[aria-label="Payment"]')
      .click();
  };

  static markInvoiceAsPaid = () => {
    cy.get('input[name="markAsPaid"]').click();
  };

  static openSendInvoiceModalByInvoiceNumber = (invoiceNumber: string) => {
    cy.contains('div[data-field="NUMBER"]', invoiceNumber)
      .parent()
      .find('div[data-field="actions"] span[aria-label="Send"] button')
      .scrollIntoView()
      .should('be.visible')
      .click();
  };

  static fillInvoiceDetails = (invoice: any) => {
    cy.wait(1500);
    cy.get('input[name="email"]')
      .clear()
      .type(invoice.recipientEmail, {force: true});
    cy.get('input[name="subject"]')
      .clear()
      .type(invoice.subject, {force: true});
    cy.get('textarea[name="content"]')
      .clear()
      .type(invoice.text, {force: true});
  };

  static sendInvoice = () => {
    cy.contains('button', 'Send email').click();
  };

  static getRowByIndex = (index: number) =>
    cy.get(`div[role="row"][data-rowindex="${index}"]`);

  static getInputByLabel = (label: string) =>
    cy
      .contains('label', label)
      .invoke('attr', 'for')
      .then((id) => {
        cy.get(`input[id="${id}"]`);
      });

  static createInvoice = (options?: {setExpiredDueDate?: boolean}) => {
    cy.contains('button', 'New Invoice').click();
    cy.get('span[role="progressbar"]').should('not.exist');

    // select customer
    cy.get('input[role="combobox"][name="propertyOwnerId"]').parent().click();
    cy.get(`li[role="option"][id="combo-box-demo-option-0"]`).click();

    // add article
    cy.contains('button', 'Add Article').click();
    cy.get('div[test-id="name-0"]').click();
    const articlesTable = cy.get('table[aria-label="articles table"]');
    // clicking second row because first row is table header
    const secondRow = articlesTable.find('tr').eq(2);
    secondRow.click();

    cy.get('input[name="quantity"]').clear().type('1');
    cy.get('input[name="unitAmount.netAmount"]').clear().type('100');

    if (options?.setExpiredDueDate) {
      // clear due date in case it's already set
      cy.contains('label', 'Payment Due Date').click();
      cy.contains('button', 'Clear').click();
      cy.wait(1000); // wait for the due date to be cleared

      cy.contains('label', 'Payment Due Date').click();
      cy.get('button:has(+button[aria-current="date"])').click();
      cy.contains('button', 'Confirm').click();
    }

    cy.contains('button', 'Save').click();
    cy.contains('Invoice created successfully');
  };

  static sendInvoices = () => {
    const sendInvoiceAPI = `${
      Cypress.env().REACT_APP_API_URL
    }/api/invoices/*/send`;
    cy.intercept('POST', sendInvoiceAPI).as('sendInvoiceAPI');
    cy.contains('Send').click();
    cy.contains('label', 'Send to').click();
    cy.focused().type('{backspace}noman+1@mainteny.com{enter}');
    cy.get('div[contenteditable="true"]').type('I am Text!');
    cy.contains('button', 'Send email').click();
    cy.wait('@sendInvoiceAPI', {timeout: 30000});
    cy.contains('Invoice sent successfully');
  };
}
