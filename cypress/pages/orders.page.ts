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
    cy.get('div#Status[role="button"]').click();

    statuses.forEach((item) => {
      cy.get('ul[role="listbox"]')
        .find(`li[role="option"][data-value="${item}"]`)
        .click();
    });
  };
}
