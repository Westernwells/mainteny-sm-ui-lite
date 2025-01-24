import {capitalize, isEqual} from 'lodash';
import {CONTRACT_STATUS_FILTER, ContractStatus} from 'models/contract';
import {mapFilterOptionToStatus} from 'utils/contract';
import {navigateCy} from '../utils/utils';
import TableFilter from '../utils/tableFilter';

export default class ContractListingPage {
  static visit = () => {
    navigateCy('customer-center', 'contracts');
  };

  static clearFilter = () => {
    cy.get('input[placeholder="Search"]').clear({force: true});
  };

  static navigateToDetailsPage = () => {
    cy.wait('@getContracts').then((interception) => {
      // open action menu and click create credit note

      cy.get('tr[data-rowindex="0"]').children('td[data-field="NAME"]').click();

      const contractId = interception.response.body.data[0]?.id;
      if (contractId) {
        cy.url().should('contain', `${contractId}`);
      } else {
        cy.log('Unable to retrieve contract ID from the intercepted data.');
      }
    });
  };

  static waitForContractApi = (
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
        ContractListingPage.waitForContractApi(
          apiAlias,
          queryParamsToMatch,
          callback,
        );
      }
    });
  };

  static filterByPrice = ({from, to}: {from: string; to: string}) => {
    TableFilter.openFilter();

    cy.contains('h6', 'Net amount')
      .parent()
      .find('input[placeholder="Min"]')
      .type(from);

    cy.wait(500);
    cy.contains('h6', 'Net amount')
      .parent()
      .find('input[placeholder="Max"]')
      .type(to);
    cy.wait(5000);

    TableFilter.acceptFilter();
  };

  static filterByStatus = (status: string) => {
    TableFilter.filterListByStatus(status);
  };

  static checkGridForStatusExclusion = (
    statusToCheck: CONTRACT_STATUS_FILTER,
    statusesToExclude: ContractStatus[],
  ) => {
    const displayStatus = capitalize(statusToCheck);

    ContractListingPage.filterByStatus(displayStatus);
    cy.get('span[role="progressbar"]').should('not.exist');

    cy.url().should('include', `${statusToCheck}`);

    ContractListingPage.waitForContractApi(
      '@getContracts',
      {
        status: mapFilterOptionToStatus(statusToCheck),
      },
      () => {
        cy.wait(1000);

        cy.get('tbody').then((tableBody) => {
          if (
            tableBody.find("td[data-field='STATUS'][role='cell']").length > 0
          ) {
            cy.wrap(tableBody)
              .find("td[data-field='STATUS'][role='cell']")
              .each((rowElement) => {
                const statusText = rowElement.text().trim();

                expect(statusText).to.equal(displayStatus);

                statusesToExclude.forEach((status: ContractStatus) => {
                  const displayExcludeStatus = capitalize(status);
                  expect(statusText).not.to.equal(displayExcludeStatus);
                });
              });
          } else {
            cy.contains('There are no entries for the applied filters.').should(
              'exist',
            );
          }
        });
      },
    );
    // deselect status
    ContractListingPage.filterByStatus(displayStatus);
  };
}
