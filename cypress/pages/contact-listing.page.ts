import {isEqual} from 'lodash';
import {navigateCy, statusMapping} from '../utils/utils';

export default class ContractListingPage {
  static visit = () => {
    navigateCy('customer-center', 'contracts');
  };

  static clearFilter = () => {
    cy.contains('Clear all').click({force: true});
  };

  static navigateToDetailsPage = () => {
    cy.wait('@getContracts').then((interception) => {
      const contractId = interception.response.body.data[0]?.id;
      if (contractId) {
        cy.get('div[data-colindex="1"]').eq(0).click();
        cy.url().should('contain', `${contractId}`);
      } else {
        cy.log('Unable to retrieve contract ID from the intercepted data.');
      }
    });
  };

  static filterContractByPrice = () => {
    cy.get('div[role="combobox"][id="Price\\ Range"]').click({force: true});
    cy.get('ul[role="listbox"] li:nth-child(1)').click({force: true});
  };

  static filterContractByStatus = (status: string) => {
    cy.get('ul[role="listbox"]').contains(status).click({force: true});
    cy.url().should('include', `${statusMapping[status]}`);
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
}
