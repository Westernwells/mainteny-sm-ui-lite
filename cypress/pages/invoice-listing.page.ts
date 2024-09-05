import {isEqual} from 'lodash';
import {InvoiceStatusView} from '../../src/models/invoice';
import {mapInvoiceStatus, InvoiceView} from '../utils/utils';

export default class InvoiceListingPage {
  static visit = () => {
    const apiEndpoint = `${
      Cypress.env().REACT_APP_API_URL
    }/api/serviceCompanies/*/invoices?*`;

    cy.intercept('GET', apiEndpoint).as('getInvoices');

    cy.get('ul > div[role="button"][data-testid="invoices-nav-item"]').click();

    cy.wait('@getInvoices');
  };

  static clearFilter = () => {
    cy.contains('Clear filter').click({force: true});
  };

  static filterInvoicesByPrice = () => {
    cy.get('div[role="combobox"][id="Price\\ Range"]').click({force: true});
    cy.get('ul[role="listbox"] li:nth-child(1)').click({force: true});
  };

  static filterInvoicesListByStatus = (status: InvoiceStatusView) => {
    cy.get('div[role="combobox"][id="Status"]').click({force: true});
    cy.get('ul[role="listbox"] li').contains(status).click({force: true});
  };

  static waitForInvoiceApi = (
    apiAlias: string,
    queryParamsToMatch: {[key: string]: string | string[]},
    callback: () => void,
  ) => {
    cy.wait(apiAlias).then((interception) => {
      const queryParams = new URLSearchParams(interception.request.url);

      let isAllMatched = true;

      if (queryParamsToMatch) {
        const keys = Object.keys(queryParamsToMatch);

        keys.forEach((key) => {
          const isObject = typeof queryParamsToMatch[key] === 'object';
          const queryValue = isObject
            ? queryParams.getAll(key)
            : queryParams.get(key);

          if (isObject && !isEqual(queryValue, queryParamsToMatch[key])) {
            isAllMatched = false;
          }

          if (!isObject && queryValue !== queryParamsToMatch[key]) {
            isAllMatched = false;
          }
        });
      }

      if (isAllMatched) {
        callback();
      } else {
        InvoiceListingPage.waitForInvoiceApi(
          apiAlias,
          queryParamsToMatch,
          callback,
        );
      }
    });
  };

  static checkGridForStatusExclusion = (
    statusToCheck: InvoiceStatusView,
    statusesToExclude: InvoiceStatusView[],
  ) => {
    const apiEndpoint = `/api/serviceCompanies/*/invoices?*`;
    cy.intercept('GET', apiEndpoint).as('getInvoices');

    InvoiceListingPage.filterInvoicesListByStatus(statusToCheck);

    cy.url().should('include', `${mapInvoiceStatus(statusToCheck)}`);

    InvoiceListingPage.waitForInvoiceApi(
      '@getInvoices',
      {
        status: mapInvoiceStatus(statusToCheck),
      },
      () => {
        cy.wait(300);

        cy.get('div[role="grid"]').as('grid');

        cy.get(`@grid`)
          .find("div[data-field='status'][role='cell']")
          .each((rowElement) => {
            const statusText = rowElement.text().trim();

            expect(statusText).to.equal(statusToCheck);

            statusesToExclude.forEach((status: InvoiceStatusView) => {
              expect(statusText).not.to.equal(status);
            });
          });
      },
    );
  };

  static navigateToDetailsPage = () => {
    let getInvoicesInterception: {body: {data: InvoiceView[]}} | undefined;

    cy.intercept(
      'GET',
      `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?*`,
      (req) => {
        req.reply((res) => {
          getInvoicesInterception = res;
        });
      },
    ).as('getInvoices');

    cy.visit(`/invoices`, {
      failOnStatusCode: false,
    });

    cy.wait('@getInvoices').then(() => {
      const invoiceId = getInvoicesInterception.body.data[0]?.id;
      if (invoiceId) {
        cy.get('div[data-colindex="1"]').eq(0).click();
        cy.url().should('contain', `${invoiceId}`);
      } else {
        cy.log('Unable to retrieve invoice ID from the intercepted data.');
      }
    });
  };
}
