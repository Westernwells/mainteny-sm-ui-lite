import {addDays} from 'date-fns';
import {InvoiceStatusView} from '../../src/models/invoice';
import {navigateCy} from '../utils/utils';

export default class InvoicesPage {
  static visit = () => {
    navigateCy('finance', 'invoices');
  };

  static filterInvoicesListByStatus = (status: InvoiceStatusView) => {
    cy.get('div[role="combobox"][aria-labelledby="Status"]').click();
    cy.get('li[role="option"]').contains(status).click();
  };

  static openSendInvoiceModal = () => {
    cy.get('span[aria-label="Send"] button:last').click({force: true});
  };

  static openPaymentModal = () => {
    InvoicesPage.getRowByIndex(0)
      .find('button[data-testid="invoice-action-menu-button"]')
      .click();
    cy.contains('li', 'Payment').click();
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
    cy.get(`tr[role="row"][data-rowindex="${index}"]`);

  static getInputByLabel = (label: string) =>
    cy
      .contains('label', label)
      .invoke('attr', 'for')
      .then((id) => {
        cy.get(`input[id="${id}"]`);
      });

  static createInvoice = (options?: {
    setExpiredDueDate?: boolean;
    hasDueDate?: boolean;
  }) => {
    const {setExpiredDueDate = false, hasDueDate = true} = options || {};

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

    cy.get('div[role="textbox"][name="paymentTerms"]').clear();

    cy.get('[data-testid=payment-due-date]').click();
    cy.wait(500);

    cy.get('[data-testid=payment-due-date-popup]').should('be.visible');

    cy.contains('button', 'Clear').should('exist').click();

    cy.wait(500);
    cy.get('[data-testid=payment-due-date]').click({force: true});

    if (hasDueDate) {
      if (setExpiredDueDate) {
        cy.get('button[aria-current="date"]')
          .invoke('attr', 'data-timestamp')
          .then((timestamp) => {
            const currentDate = new Date(parseInt(timestamp, 10));
            const previousDate = addDays(currentDate, -1);
            const previousDayTimestamp = previousDate.getTime();
            cy.get(`button[data-timestamp="${previousDayTimestamp}"]`).click(); // Click the button for the previous day
          });
      } else {
        cy.get('button[aria-current="date"]')
          .invoke('attr', 'data-timestamp')
          .then((timestamp) => {
            const currentDate = new Date(parseInt(timestamp, 10));
            const nextDate = addDays(currentDate, 1);
            const nextDayTimestamp = nextDate.getTime();
            cy.get(`button[data-timestamp="${nextDayTimestamp}"]`).click(); // Click the button for the next day
          });
      }
    }


    cy.contains('button', 'Confirm').click();
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

  static printInvoices = (options?: {hasDueDate?: boolean}) => {
    cy.get('[data-testid="bottom-drawer"]')
      .find('button svg[data-testid="MoreVertIcon"]')
      .click();
    cy.contains('Print').click();
    cy.contains('Print invoice').should('exist');
    cy.contains('button', 'Print').click();

    if (options?.hasDueDate) {
      cy.contains('Invoice updated successfully').should('exist');
    } else {
      cy.contains(
        'Error: A payment due date is required to send the invoice. Please add this information to proceed',
      ).should('exist');
    }
  };
}
