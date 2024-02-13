export default class ServiceJobPage {
  static visit = () => {
    cy.visit('/orders', {
      failOnStatusCode: false,
    });
  };

  static changeTab = (index: number) => {
    cy.get(`div[role="tablist"] [data-aria-label="tab-item-${index}"]`).click();
  };

  static selectTechnician = () => {
    cy.get('input[name="technicianId"]').parent().click();
    cy.wait(300);
    cy.get('li[role="option"]').first().click();
  }

  static submitData = () => {
    this.selectTechnician();

    // select start and end time
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

  static goNext = () => {
    cy.contains('button', 'Next').should('not.be.disabled').click();
    cy.wait(200);
  }

  static getFirstTableElement = () => cy.get('[role="cell"]').first()
}
