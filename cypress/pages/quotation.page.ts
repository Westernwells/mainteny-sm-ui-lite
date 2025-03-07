import {navigateCy} from '../utils/utils';
import QuotationsPage from './quotations.page';

export default class QuotationPage {
  static visit = () => {
    navigateCy('finance', 'quotations');
    cy.waitForSpinnerToDisappear();
  };

  static navigateTo = (path: string) => {
    cy.visit(`/quotations/${path}`, {
      failOnStatusCode: false,
    });
  };

  static openNewQuotation = () => {
    cy.contains('New Quotation').click();
  };

  static openDialog = (dialogTitle: string) => {
    cy.contains(dialogTitle);
  };

  static addNewCustomer = () => {
    cy.contains('Add New Customer').click();
    QuotationPage.openDialog('Add New Customer');
    const outside = cy.get('#alert-dialog-title');

    cy.get('input[name="name"]').clear();
    outside.click();
    cy.get('input[name="name"]')
      .parent()
      .siblings('p')
      .should('have.text', 'Customer Name is required');
    cy.contains('Next').should('be.disabled');

    cy.get('input[name="name"]').type('Test Company');

    cy.contains('Next').should('not.be.disabled');

    cy.contains('Next').click();

    cy.get('input[name="billingAddress.component.name"]').should(
      'have.value',
      'Test Company',
    );
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains('Customer created successfully');

    cy.get('input[name="propertyOwnerId"]').should(
      'have.value',
      'Test Company',
    );
  };

  static addNewUnit = () => {
    cy.contains('Add New Unit').click();
    cy.contains('Next').should('be.disabled');

    cy.get('div[data-colindex="1"]').eq(1).click();

    cy.contains('Next').should('not.be.disabled');

    cy.contains('Next').click();

    cy.contains('Next').should('be.disabled');

    const outside = cy.get('#alert-dialog-title');

    cy.get('input[name="address.fullName"]').clear();
    outside.click();
    cy.get('input[name="address.fullName"]')
      .parent()
      .siblings('p')
      .should('have.text', 'Address is required');

    cy.get('input[name="address.fullName"]').type('33 Kehinde');
    cy.contains('Address not found. Please check and try again').should(
      'not.exist',
    );
    cy.contains('33 Kehinde Owolabi').first().click();
    cy.wait(300);

    cy.get('input[name="address.component.city"]').should(
      'have.value',
      'Lagos',
    );

    cy.get('input[name="address.component.postalCode"]').should(
      'have.value',
      '102213',
    );

    cy.get('input[name="address.component.country"]').should(
      'have.value',
      'Nigeria',
    );

    cy.get('input[name="address.component.state"]').should(
      'have.value',
      'Lagos',
    );

    cy.contains('Next').should('not.be.disabled');
    cy.contains('Next').click();

    cy.get('input[name="category"]').clear();
    cy.contains('Escalator').click();
    cy.get('input[name="category"]').should('have.value', 'Escalator');
    cy.contains('Next').should('not.be.disabled');
    cy.contains('Next').click();

    cy.get('input[name="technicianNumber"]').type((3).toString(), {
      force: true,
    });
    cy.get('input[name="serviceTime"]').type((30).toString(), {force: true});
    cy.get('input[name="lastVisitDate"]').click();
    cy.get('input[name="lastVisitDate"]')
      .parent()
      .siblings('p')
      .should('have.text', 'Last visit is required');

    cy.get('button[aria-current="date"]')
      .invoke('attr', 'data-timestamp')
      .then((timestamp) => {
        const todayDateTimestamp = parseInt(timestamp, 10);
        cy.get(`button[data-timestamp="${todayDateTimestamp}"]`).click({
          force: true,
        });
      });

    cy.contains('Next').should('not.be.disabled');

    cy.contains('Next').click();

    cy.contains('Next').click();
    cy.contains('Next').click();

    const postElevatorAPI = `${Cypress.env().REACT_APP_API_URL}/api/elevators`;
    cy.intercept('POST', postElevatorAPI).as('postElevatorAPI');
    cy.contains('Create Unit').click();

    cy.contains('Unit created successfully');
    cy.wait('@postElevatorAPI').then((interception) => {
      const {body} = interception.request;

      cy.contains(body.address.fullName);
    });
  };

  static saveQuotation = () => {
    cy.get('button').contains('Save').click();
  };

  static checkForGeneratingPDFBlob = () => {
    cy.window().then((win) => {
      cy.spy(win.URL, 'createObjectURL').as('createObjectURLSpy');
    });
    cy.get('@createObjectURLSpy').should('have.been.called');
    cy.wait(5000);
  };

  static checkForDownloadedPDF = (quotationNumber: string) => {
    /* assert Download PDF */
    cy.task('downloads', 'cypress/downloads').then((d: string[]) => {
      const lastDownloadedFile = d[d.length - 1];
      cy.task('readPdf', `cypress/downloads/${lastDownloadedFile}`)
        .its('text')
        .should('contain', quotationNumber);
    });
  };

  static getQuotationNumberElement = () =>
    cy.get('h6[data-testid="quotation-number"]').should('exist');

  static waitForSpinnerToDisappear = () => {
    cy.get('span[role="progressbar"]', {timeout: 10000}).should('not.exist');
  };

  static verifyDownloadedPDF = () => {
    QuotationPage.getQuotationNumberElement()
      .invoke('text')
      .then((quotationNumber) => {
        cy.log(`Verifying downloaded PDF contains: ${quotationNumber}`);
        cy.task('downloads', 'cypress/downloads').then((downloads: unknown) => {
          if (Array.isArray(downloads) && downloads.length > 0) {
            const lastDownloadedFile = downloads[downloads.length - 1];
            cy.task('readPdf', `cypress/downloads/${lastDownloadedFile}`)
              .its('text')
              .should('contain', quotationNumber);
          } else {
            throw new Error('No downloaded files found');
          }
        });
      });
  };

  static navigateToFirstQuotation = (statusAlias) => {
    cy.wait(statusAlias);
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    QuotationsPage.navigateToDetailsPage(0);
    cy.wait('@downloadedPDF');
  };

  static filterQuotationTableByStatus = (status) => {
    cy.get('[data-testid="status-filter"]').click();
    cy.contains(status).click();
    cy.wait(1000);
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  };

  static waitForDownload = () => {
    cy.waitUntil(
      () =>
        cy
          .task('downloads', 'cypress/downloads')
          .then(
            (downloads: unknown) =>
              Array.isArray(downloads) && downloads.length > 0,
          ),
      {
        timeout: 15000,
        interval: 500,
      },
    );
  };
}
