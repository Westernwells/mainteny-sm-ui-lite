import {isEqual} from 'lodash';

export default class OrdersPage {
  static visit = () => {
    cy.get('ul > div[role="button"][data-testid="jobs-nav-item"]').click();
  };

  static changeTab = (index: number) => {
    cy.get(`div[role="tablist"] [data-aria-label="tab-item-${index}"]`).click();
  };

  static changeStatusFilter = (status: string) => {
    cy.contains('button', status).click({force: true});
  };

  static changeTypeFilter = (type: string) => {
    cy.contains('span.MuiChip-label', type).click();
    cy.contains('button', 'Show Results').click();
  };

  static openFilters = () => {
    cy.contains('div', 'Filters').click();
  };

  // Recursively wait for all job query api calls until the provided query parameter is matched
  static waitForAllJobQueryApi = (
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
        OrdersPage.waitForAllJobQueryApi(
          apiAlias,
          queryParamsToMatch,
          callback,
        );
      }
    });
  };
}
