export default class NewServiceJobPage {
  static selectADueDate = () => {
    // select due date and check if 'Next' button is enabled
    cy.get('input[type="radio"][value="DUE_DATE"]').click();
    cy.get('button').contains('Next').should('not.be.disabled')
  }

  static selectTechnician = () => {
    cy.get('input[role="combobox"]').parent().click();
    cy.get('li[role="option"]').first().click();
  }

  static selectADateTimeAndTechnician = () => {
    // select date and time
    cy.get('input[type="radio"][value="SCHEDULE_TECHNICIAN"]').click();

    this.selectTechnician();

    cy.get('button').contains('Next').should('not.be.disabled')
  }

  static selectImmediate = () => {
    // select immediate and click 'Add More'
    cy.get('input[type="radio"][value="IMMEDIATE"]').click();
    cy.get('button').contains('Add More').should('not.be.disabled').click();

    // select technician and click 'Add'
    this.selectTechnician();
    cy.get('button').contains('Add').should('not.be.disabled').click();

    // select added technician and check if 'Next' button is enabled
    cy.get('input[type="checkbox"]').first().click();
    cy.get('button').contains('Next').should('not.be.disabled')
  }
}
  