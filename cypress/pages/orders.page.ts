import {isEqual} from 'lodash';

export default class OrdersPage {
  static visit = () => {
    cy.get('ul > div[role="button"][data-testid="jobs-nav-item"]').click();
  };

  static changeTab = (index: number) => {
    cy.get(`div[role="tablist"] [data-aria-label="tab-item-${index}"]`).click();
  };

  static changeStatusFilter = (statuses: string[]) => {
    cy.get('div[aria-labelledby="Job Status"]').click();

    statuses.forEach((item) => {
      cy.get('ul[role="listbox"]')
        .find(`li[role="option"][data-value="${item}"]`)
        .click();
    });
  };

  static changeTypeFilter = (types: string[]) => {
    cy.get('div[aria-labelledby="Job Type"]').click();

    types.forEach((item) => {
      cy.get('ul[role="listbox"]')
        .find(`li[role="option"][data-value="${item}"]`)
        .click();
    });
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
