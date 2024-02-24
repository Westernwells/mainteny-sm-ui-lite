import { isEqual } from 'lodash';
import { ContractView} from '../../src/models/contract';
import { statusMapping } from '../utils/utils';

export default class ContractListingPage {
  static visit = () => {
    const apiEndpoint = `${Cypress.env().REACT_APP_API_URL}/api/contracts?*`;

    cy.intercept('GET', apiEndpoint).as('getContracts');

    cy.visit(`/contracts`, {
      failOnStatusCode: false,
    });

    cy.wait('@getContracts');
  };

  static clearFilter = () => {
    cy.contains('Clear all').click({force: true});
  };

  static navigateToDetailsPage = () => {
    let getContractInterception: {body: {data: ContractView[]}} | undefined;

    cy.intercept(
      'GET',
      `${Cypress.env().REACT_APP_API_URL}/api/contracts?*`,
      (req) => {
        req.reply((res) => {
          getContractInterception = res;
        });
      },
    ).as('getContracts');

    cy.visit(`/contracts`, {
      failOnStatusCode: false,
    });

    cy.wait('@getContracts').then(() => {
      const contractId = getContractInterception.body.data[0]?.id;
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
