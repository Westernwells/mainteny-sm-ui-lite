import {addDays} from 'date-fns';
import {navigateCy} from '../utils/utils';
import OrdersPage from './orders.page';

type ScheduleModal = {
  changeDueDate?: boolean;
  withSchedule?: boolean;
  removeSchedule?: boolean;
  assignEngineersCount?: number;
};

export default class ServiceJobPage {
  static visit = () => {
    navigateCy('jobs', 'list');
    cy.waitForSpinnerToDisappear();
  };

  static openAssignEngineerDialog = () => {
    cy.get('[data-testid="assign-engineer"]:visible', {timeout: 5000})
      .should('be.visible')
      .first()
      .click({waitForAnimations: true});
  };

  static assignEngineer = (props: ScheduleModal = {}) => {
    cy.wait('@technicianApi');
    ServiceJobPage.submitData(props);
  };

  static unscheduleFirstJob = () => {
    OrdersPage.changeStatusFilter('Pending');
    cy.get('table', {timeout: 5000}).should('be.visible');
    cy.contains('td', /Scheduled/, {timeout: 5000})
      .first()
      .closest('tr')
      .within(() => {
        cy.get('button[aria-haspopup="true"]').click();
      });
    cy.contains('li', 'Unschedule').click();
    cy.contains('button', 'Yes').click();
    cy.contains('Service job has been unscheduled', {timeout: 5000}).should(
      'be.visible',
    );
  };

  static changeTab = (index: number) => {
    cy.get(`div[role="tablist"] [data-aria-label="tab-item-${index}"]`).click();
  };

  static selectTechnician = () => {
    cy.get('button[aria-label="Open"]').click({ force: true });
    cy.wait(300);
    cy.get('li[role="option"]').first().click();
  };

  static selectTechnicianWithIndex = (index: number) => {
    cy.get('button[aria-label="Open"]').click({ force: true });
    cy.get(`li[role="option"][id="combo-box-demo-option-${index}"]`)
      .should('exist')
      .then(($option) => {
        // Only select if it's NOT already checked
        const checkbox = $option.find('input[type="checkbox"]');
        if (!checkbox.prop('checked')) {
          cy.wrap($option).click({force: true});
        } else {
          // Click on the dialog itself to close the dropdown
          cy.get('[role="dialog"]').click({force: true});
        }
      });
  };  
  

  static submitData = ({
    changeDueDate = true,
    withSchedule = true,
    removeSchedule = false,
    assignEngineersCount = 1,
  }: ScheduleModal = {}) => {
    for (let i = 0; i < assignEngineersCount; i += 1) {
      ServiceJobPage.selectTechnicianWithIndex(i);
    }

    if (changeDueDate) {
      cy.get('[data-testid=due-date]', {timeout: 10000})
        .should('be.visible')
        .click();

      cy.get('[data-testid=due-date-popup]', {timeout: 10000}).should(
        'be.visible',
      );

      cy.get('[data-testid=due-date-popup]').within(() => {
        cy.contains('button', 'Clear').should('exist').click({force: true});
      });

      cy.wait(2000);

      cy.get('[data-testid=due-date]').click({force: true});

      cy.get('[data-testid=due-date-popup]').should('be.visible');

      cy.get('button[aria-current="date"]')
        .invoke('attr', 'data-timestamp')
        .then((timestamp) => {
          const currentDate = new Date(parseInt(timestamp, 10));
          const futureDate = addDays(currentDate, 3);
          const newTimestamp = futureDate.getTime();

          cy.get(`button[data-timestamp="${newTimestamp}"]`).click({
            force: true,
          });
          cy.contains('button', 'Confirm').click({waitForAnimations: false});
        });
    }

    if (withSchedule) {
      cy.get('input[type="checkbox"][class*="MuiSwitch-input"]')
        .should('exist')
        .check({force: true});
      cy.contains('label', 'Start and end date').click();
      cy.get('button[aria-current="date"]').first().click({force: true});

      cy.get('button[aria-current="date"]')
        .invoke('attr', 'data-timestamp')
        .then((timestamp) => {
          const currentDate = new Date(parseInt(timestamp, 10));
          const newDate = addDays(currentDate, 10);
          const newTimestamp = newDate.getTime();

          cy.get(`button[data-timestamp="${newTimestamp}"]`).click({
            force: true,
          });
        });

      cy.contains('button', 'Confirm').click({waitForAnimations: false});

      cy.get('[data-testid=start-time]').click();
      cy.get('[data-testid=start-time-popup]').should('be.visible');
      cy.get('[data-testid=start-time-popup]').within(() => {
        cy.get('ul[aria-label="Select hours"]').should('be.visible');
        cy.get('li[aria-label="2 hours"]').click();
        cy.get('ul[aria-label="Select minutes"]').should('be.visible');
        cy.get('li[aria-label="30 minutes"]').click();
        cy.contains('button', 'Confirm').click();
      });

      cy.get('[data-testid=end-time]').click();
      cy.get('[data-testid=end-time-popup]').should('be.visible');
      cy.get('[data-testid=end-time-popup]').within(() => {
        cy.get('ul[aria-label="Select hours"]').should('be.visible');
        cy.get('li[aria-label="4 hours"]').click();
        cy.get('ul[aria-label="Select minutes"]').should('be.visible');
        cy.get('li[aria-label="45 minutes"]').click();
        cy.contains('button', 'Confirm').click();
      });
    }

    if (removeSchedule) {
      cy.get('input[type="checkbox"][class*="MuiSwitch-input"]')
        .should('exist')
        .then(($checkbox) => {
          if ($checkbox.prop('checked')) {
            cy.wrap($checkbox).uncheck({force: true});
          }
        });
    }

    cy.get('[aria-describedby="alert-dialog-description"]').click({
      force: true,
    });
    cy.wait(1000);
    cy.get('[data-testid=saveButton]')
      .should('not.be.disabled')
      .click({force: true});
    cy.contains('Service job scheduled successfully');
  };

  static goNext = () => {
    cy.contains('button', 'Next').should('not.be.disabled').click();
    cy.wait(200);
  };

  static getFirstTableElement = () => cy.get('[role="cell"]').first();

  static getUnitFirstTableElement = () => cy.get('.MuiDataGrid-row').first();
}
