export default class ServiceJobPage {
  static visit = () => {
    cy.get('ul > div[role="button"][data-testid="jobs-nav-item"]').click();
  };

  static changeTab = (index: number) => {
    cy.get(`div[role="tablist"] [data-aria-label="tab-item-${index}"]`).click();
  };

  static selectTechnician = () => {
    cy.get('input[role="combobox"]').parent().click();
    cy.wait(300);
    cy.get('li[role="option"]').first().click();
  };

  static selectTechnicianWithIndex = (index: number) => {
    cy.get('input[role="combobox"]').parent().click();
    cy.get(`li[role="option"][id="combo-box-demo-option-${index}"]`).click();
  };

  static submitData = ({
    withSchedule = true,
    assignEngineersCount = 1,
  }: {withSchedule?: boolean; assignEngineersCount?: number} = {}) => {
    for (let i = 0; i < assignEngineersCount; i += 1) {
      this.selectTechnicianWithIndex(i);
    }

    cy.contains('label', 'Due date').click();
    cy.get('button[aria-current="date"]').click();
    cy.contains('button', 'Confirm').click({waitForAnimations: false});

    if (withSchedule) {
      // enable choose a fixed date and time checkbox
      cy.get('[type="checkbox"]').check();
      cy.contains('button', 'Save').should('be.disabled');

      // select start and end date
      cy.contains('label', 'Start and end date').click();
      cy.get('button[aria-current="date"]').click();
      cy.contains('button', 'Confirm').click({waitForAnimations: false});

      // select start time
      cy.contains('label', 'Start Time').click();
      cy.get('ul[aria-label="Select hours"]')
        .get('li[aria-label="0 hours"]')
        .click();
      cy.get('ul[aria-label="Select minutes"]')
        .get('li[aria-label="0 minutes"]')
        .click();
      cy.contains('button', 'Confirm').click();
      cy.get('ul[aria-label="Select hours"]').should('not.exist');

      // select end time
      cy.contains('label', 'End Time').click();
      cy.get('ul[aria-label="Select hours"]')
        .get('li[aria-label="1 hours"]')
        .click();
      cy.get('ul[aria-label="Select minutes"]')
        .get('li[aria-label="0 minutes"]')
        .click();
      cy.contains('button', 'Confirm').click();
    }

    cy.get('[aria-describedby="alert-dialog-description"]').click({
      force: true,
    });
    cy.contains('button', 'Save').should('not.be.disabled').click();
    cy.contains('Service job scheduled successfully');
  };

  static goNext = () => {
    cy.contains('button', 'Next').should('not.be.disabled').click();
    cy.wait(200);
  };

  static getFirstTableElement = () => cy.get('[role="cell"]').first();
}
