export default class NewServiceJobPage {
  static selectADueDate = () => {
    // select due date and check if 'Next' button is enabled
    cy.get('button[aria-label^="Choose date"]').click();
    cy.get('button[aria-current="date"]').click();
    cy.contains('button', 'Confirm').click();
    cy.get('button').contains('Next').should('not.be.disabled');
  };

  static selectTechnician = () => {
    cy.get('tbody tr td label').first().click();
  };

  static selectADateTimeAndTechnician = () => {
    // select date and time
    cy.get('svg[data-testid="CalendarTodayIcon"]').click();
    cy.get('button[aria-current="date"]').click();
    cy.contains('button', 'Confirm').click();

    this.selectTechnician();

    cy.get('button').contains('Next').should('not.be.disabled');
  };
}
