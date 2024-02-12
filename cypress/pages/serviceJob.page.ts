export default class ServiceJobPage {
  static visit = () => {
    cy.visit('/orders', {
      failOnStatusCode: false,
    });
  };

  static changeTab = (index: number) => {
    cy.get(`div[role="tablist"] [data-aria-label="tab-item-${index}"]`).click();
  };

  static submitData = () => {
    cy.get('input[name="technicianId"]').type('Alisha', {delay: 150});
    cy.get('ul > li:nth-child(1)').click();
    cy.get('input[name="date"]').click();
    cy.get('[role="gridcell"]').eq(11).click({force: true});
    cy.get('input[name="startTime"]').click({force: true});
    cy.get('ul > li:nth-child(1)').eq(0).click({force: true});
    cy.get('input[name="endTime"]').click({force: true});
    cy.wait(200);
    cy.get('ul > li:nth-child(3)').eq(1).click({force: true});
    cy.get('[aria-describedby="alert-dialog-description"]').click({
      force: true,
    });
    cy.contains('button', 'Save').should('not.be.disabled').click();
    cy.contains('Service job scheduled successfully');
  };
}
