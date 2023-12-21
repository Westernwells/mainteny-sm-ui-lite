import {isEqual} from 'lodash';

export default class OrdersPage {
  static visit = () => {
    cy.visit(`/orders`, {
      failOnStatusCode: false,
    });
  };

  static changeTab = (index: number) => {
    cy.get(`div[role="tablist"] [data-aria-label="tab-item-${index}"]`).click();
  };

  static changeStatusFilter = (statuses: string[]) => {
    cy.get('div#Job\\ Status[role="button"]').click();

    statuses.forEach((item) => {
      cy.get('ul[role="listbox"]')
        .find(`li[role="option"][data-value="${item}"]`)
        .click();
    });
  };

  // Recursively wait for all job query api calls until the provided query parameter is matched
  static waitForAllJobQueryApi = (
    apiAlias: string,
    queryParamsToMatch = {},
    callback,
  ) => {
    cy.wait(apiAlias).then((interception) => {
      const queryParams = new URLSearchParams(interception.request.url);

      let isAllMatched = true;

      for (const key in queryParamsToMatch) {
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
