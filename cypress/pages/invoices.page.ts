import {addDays} from 'date-fns';
import {extractNumbersFromCurrencyString, navigateCy} from '../utils/utils';

export default class InvoicesPage {
  static visit = () => {
    navigateCy('finance', 'invoices');
    cy.waitForSpinnerToDisappear();
  };

  static openSendInvoiceModal = () => {
    cy.get('span[aria-label="Send"] button:last').click({force: true});
  };

  static openPaymentModal = () => {
    InvoicesPage.getRowByIndex(0)
      .find('button[data-testid="invoice-action-menu-button"]')
      .click();
    cy.get('li').should('be.visible');
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

  static createInvoice = ({
    setExpiredDueDate = false,
    hasDueDate = true,
  }: {
    setExpiredDueDate?: boolean;
    hasDueDate?: boolean;
  }) => {
    cy.contains('button', 'New Invoice').click();
    cy.get('span[role="progressbar"]').should('not.exist');

    // Select customer
    cy.get('input[role="combobox"][name="propertyOwnerId"]').parent().click();
    cy.get(`li[role="option"][id="combo-box-demo-option-0"]`).click();

    // Add article
    cy.contains('button', 'Add Article').click();
    cy.get('#article-combo-box').click({force: true});

    cy.get('#article-combo-box-listbox')
      .should('exist')
      .and('be.visible')
      .find('li')
      .should('have.length.greaterThan', 1);

    cy.get('#article-combo-box-listbox')
      .find('li')
      .eq(2)
      .should('be.visible')
      .click({waitForAnimations: false, force: true});

    cy.get('#article-combo-box')
      .click()
      .wait(500)
      .clear()
      .realType('Test Article')
      .realType('{esc}');
    cy.get('input[name="quantity"]').clear().type('1');
    cy.get('input[name="unitAmount.netAmount"]').clear().type('100');

    if (!hasDueDate) {
      cy.get('div[role="textbox"][name="paymentTerms"]')
        .invoke('text')
        .then(() => {
          cy.get('div[role="textbox"][name="paymentTerms"]').clear();

          cy.get('[data-testid="payment-due-date"]')
            .should('not.be.disabled')
            .click({force: true});

          cy.get('[data-testid="payment-due-date-popup"]')
            .should('be.visible')
            .within(() => {
              cy.contains('button', 'Clear').click({force: true});

              cy.contains('button', 'Confirm').click({
                waitForAnimations: false,
              });
            });
        });
    } else {
      cy.get('div[role="textbox"][name="paymentTerms"]')
        .invoke('text')
        .then((paymentTermsText) => {
          const storedPaymentTerms = paymentTermsText;

          cy.get('[data-testid="payment-due-date"]').then(($dateInput) => {
            if ($dateInput.prop('disabled')) {
              cy.get('div[role="textbox"][name="paymentTerms"]').clear();

              cy.wrap($dateInput)
                .invoke('val')
                .then((currentValue) => {
                  const valueStr = String(currentValue);
                  const [day, month, year] = valueStr.split('.');
                  const dateObj = new Date(+year, +month - 1, +day);

                  if (dateObj < new Date()) {
                    cy.get('[data-testid="payment-due-date"]')
                      .should('not.be.disabled')
                      .click({force: true});

                    cy.get('[data-testid="payment-due-date-popup"]')
                      .should('be.visible')
                      .within(() => {
                        cy.contains('button', 'Clear').click({force: true});
                      });

                    cy.wait(500);
                    cy.get('[data-testid="payment-due-date"]').click({
                      force: true,
                    });
                    cy.get('[data-testid="payment-due-date-popup"]').should(
                      'be.visible',
                    );

                    if (setExpiredDueDate) {
                      cy.get('button[aria-current="date"]')
                        .invoke('attr', 'data-timestamp')
                        .then((timestamp) => {
                          const currentDate = new Date(parseInt(timestamp, 10));
                          const nextDate = addDays(currentDate, 3);
                          const nextDayTimestamp = nextDate.getTime();
                          cy.get(
                            `button[data-timestamp="${nextDayTimestamp}"]`,
                          ).click();
                        });
                    } else {
                      cy.get('button[aria-current="date"]')
                        .invoke('attr', 'data-timestamp')
                        .then((timestamp) => {
                          const currentDate = new Date(parseInt(timestamp, 10));
                          const previousDate = addDays(currentDate, -3);
                          const previousDayTimestamp = previousDate.getTime();
                          cy.get(
                            `button[data-timestamp="${previousDayTimestamp}"]`,
                          ).click();
                        });
                    }

                    cy.contains('button', 'Confirm').click({
                      waitForAnimations: false,
                    });
                    cy.get('div[role="textbox"][name="paymentTerms"]').type(
                      storedPaymentTerms,
                      {force: true},
                    );
                  }
                });
            }
          });
        });
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

  static waitUntilTableLoaded = () => {
    cy.get('table[aria-label="invoices table"]', {timeout: 60000}).should(
      'be.visible',
    );
    cy.get('tr[role="row"][data-rowindex="0"]', {timeout: 60000}).should(
      'exist',
    );
  };

  static verifyPaidAmountMatchesRow(rowIndex, currency, fractionDigits) {
    InvoicesPage.getRowByIndex(rowIndex)
      .find('td[role="cell"][data-field="TOTAL_NET_AMOUNT"]')
      .invoke('text')
      .then((amount) => {
        const numericAmount = extractNumbersFromCurrencyString(amount);
        const formattedAmount = numericAmount.toLocaleString(currency, {
          maximumFractionDigits: fractionDigits,
        });

        // Open action menu and wait for it
        InvoicesPage.getRowByIndex(rowIndex)
          .find('button[data-testid="invoice-action-menu-button"]')
          .should('be.visible')
          .click();

        // Ensure the action menu is visible before interacting with it
        cy.get('[data-testid="invoice-action-menu"]', {timeout: 5000})
          .should('be.visible')
          .within(() => {
            cy.get('[data-testid="invoice-action-menu-item-Payment"]')
              .should('be.visible')
              .click({force: true});
          });

        InvoicesPage.getInputByLabel('Paid amount (incl. VAT)')
          .should('be.visible')
          .should('have.value', formattedAmount, {timeout: 15000});
      });
  }

  static createAndSendInvoice({
    setExpiredDueDate,
    hasDueDate,
  }: {
    setExpiredDueDate?: boolean;
    hasDueDate?: boolean;
  }) {
    InvoicesPage.createInvoice({setExpiredDueDate, hasDueDate});
    cy.get('span[role="progressbar"]').should('not.exist');
    cy.wait(['@invoicesApi', '@invoicesApi']); // Wait for invoice calls
    cy.get('div[class^="react-pdf__Page__textContent"]')
      .should('exist')
      .then(() => {
        InvoicesPage.sendInvoices();
      });
  }
}
