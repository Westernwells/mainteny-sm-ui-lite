import {isEqual} from 'lodash';
import TableFilter from '../utils/tableFilter';
import {InvoiceStatusView} from '../../src/models/invoice';
import {mapInvoiceStatus, navigateCy} from '../utils/utils';

export default class InvoiceListingPage {
  static visit = () => {
    const apiEndpoint = `${
      Cypress.env().REACT_APP_API_URL
    }/api/serviceCompanies/*/invoices?*`;

    cy.intercept('GET', apiEndpoint).as('getInvoices');

    navigateCy('finance', 'invoices');

    cy.wait('@getInvoices');
    cy.get('span[role="progressbar"]').should('not.exist');
  };

  static clearFilter = () => {
    cy.contains('Clear filter').click({force: true});
  };

  static filterInvoicesByPrice = ({from, to}: {from: string; to: string}) => {
    TableFilter.openFilter();
    cy.get('input[placeholder="Min"]').type(from);
    cy.wait(500);
    cy.get('input[placeholder="Max"]').type(to);
    cy.wait(5000);
    TableFilter.acceptFilter();
  };

  static filterInvoicesListByStatus = (status: InvoiceStatusView) => {
    cy.contains('button', new RegExp(`^${status}[a-zA-Z]*`)).click({
      force: true,
    });
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
    InvoiceListingPage.filterInvoicesListByStatus(statusToCheck);

    cy.get('span[role="progressbar"]').should('not.exist');

    // Ensure the correct status is applied in the URL
    cy.url().should('include', `${mapInvoiceStatus(statusToCheck)}`);

    InvoiceListingPage.waitForInvoiceApi(
      '@getInvoices',
      {status: mapInvoiceStatus(statusToCheck)},
      () => {
        cy.wait(1000);

        cy.get("td[data-field='STATUS'][role='cell']")
          .should('have.length.greaterThan', 0)
          .each(($row) => {
            cy.wrap($row).invoke('text').should('equal', statusToCheck)

            statusesToExclude.forEach((status) => {
              cy.wrap($row).invoke('text').should('not.equal', status);
            });
          });
      },
    );

    // Deselect the status to reset filters
    InvoiceListingPage.filterInvoicesListByStatus(statusToCheck);
  };

  static navigateToDetailsPage = () => {
    cy.intercept(
      'GET',
      `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?*`,
    ).as('getInvoices');

    cy.visit(`/invoices`, {
      failOnStatusCode: false,
    });

    cy.wait('@getInvoices').then((interception) => {
      const invoiceId = interception.response.body?.data?.[0]?.id;
      if (invoiceId) {
        cy.get('td[role="cell"][data-field="SENT_DATE"]').eq(0).click();
        cy.url().should('contain', `${invoiceId}`);
      } else {
        cy.log('Unable to retrieve invoice ID from the intercepted data.');
      }
    });
  };
}
