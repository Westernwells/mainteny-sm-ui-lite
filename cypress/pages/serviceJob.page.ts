import {navigateCy} from '../utils/utils';

export default class ServiceJobPage {
  static visit = () => {
    navigateCy('jobs', 'list');
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

    cy.get('[data-testid=due-date]').click();
    cy.get('[data-testid=due-date-popup]').should('be.visible');

    cy.get('[data-testid=due-date-popup]').within(() => {
      cy.get('button[aria-current="date"]')
        .should('be.visible')
        .click({force: true});
      cy.contains('button', 'Confirm').click({waitForAnimations: false});
    });

    if (withSchedule) {
      // enable choose a fixed date and time checkbox
      cy.get('[type="checkbox"]').check();

      // select start and end date
      cy.contains('label', 'Start and end date').click();
      cy.get('button[aria-current="date"]')
        .should('be.visible')
        .click({force: true});
      cy.contains('button', 'Confirm').click({waitForAnimations: false});

      // select start time
      cy.get('[data-testid=start-time]').click();
      cy.get('[data-testid=start-time-popup]').should('be.visible');

      cy.get('[data-testid=start-time-popup]').within(() => {
        cy.get('ul[aria-label="Select hours"]').should('be.visible');
        cy.get('li[aria-label="2 hours"]').click();

        cy.get('ul[aria-label="Select minutes"]').should('be.visible');
        cy.get('li[aria-label="30 minutes"]').click();

        cy.contains('button', 'Confirm').click();
      });

      cy.get('[data-testid=start-time-popup]').should('not.exist');

      // select end time
      cy.get('[data-testid=end-time]').click();
      cy.get('[data-testid=end-time-popup]').should('be.visible');

      cy.get('[data-testid=end-time-popup]').within(() => {
        cy.get('ul[aria-label="Select hours"]').should('be.visible');
        cy.get('li[aria-label="4 hours"]').click();

        cy.get('ul[aria-label="Select minutes"]').should('be.visible');
        cy.get('li[aria-label="45 minutes"]').click();

        cy.contains('button', 'Confirm').click();
      });

      cy.get('[data-testid=end-time-popup]').should('not.exist');
    }

    cy.get('[aria-describedby="alert-dialog-description"]').click({
      force: true,
    });
    cy.get('[data-testid=saveButton]').should('not.be.disabled').click({
      force: true,
    });
    cy.contains('Service job scheduled successfully');
  };

  static goNext = () => {
    cy.contains('button', 'Next').should('not.be.disabled').click();
    cy.wait(200);
  };

  static getFirstTableElement = () => cy.get('[role="cell"]').first();
}
