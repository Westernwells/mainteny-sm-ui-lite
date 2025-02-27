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
  };

  static openAssignEngineerDialog = () => {
    cy.get('[data-testid="assign-engineer"]:visible', {timeout: 5000})
      .should('be.visible')
      .first()
      .click({waitForAnimations: true});
  };

  static assignEngineer = (props: ScheduleModal = {}) => {
    cy.wait('@technicianApi')
      .its('response.body.data')
      .then((technicians) => {
        if (technicians.length) {
          ServiceJobPage.submitData(props);
        }
      });
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
    cy.get('input[role="combobox"]').parent().click();
    cy.wait(300);
    cy.get('li[role="option"]').first().click();
  };

  static selectTechnicianWithIndex = (index: number) => {
    cy.get('input[role="combobox"]').parent().click();
    cy.get(`li[role="option"][id="combo-box-demo-option-${index}"]`).click();
  };

  static submitData = ({
    changeDueDate = true,
    withSchedule = true,
    removeSchedule = false,
    assignEngineersCount = 1,
  }: ScheduleModal = {}) => {
    for (let i = 0; i < assignEngineersCount; i += 1) {
      this.selectTechnicianWithIndex(i);
    }

    if (changeDueDate) {
      cy.log('Selecting or changing  due date for the job');
      cy.get('[data-testid=due-date]').click();
      cy.get('[data-testid=due-date-popup]').should('be.visible');

      cy.get('[data-testid=due-date-popup]').within(() => {
        cy.get('button[aria-current="date"]')
          .should('be.visible')
          .click({force: true});
        cy.contains('button', 'Confirm').click({waitForAnimations: false});
      });
    }

    if (withSchedule) {
      cy.log('Scheduling time for the job');
      // enable choose a fixed date and time checkbox
      cy.get('[type="checkbox"]').check();

      // select start and end date
      cy.contains('label', 'Start and end date').click();
      // Click the start date (current selected date)
      cy.get('button[aria-current="date"]').first().click({force: true});

      // Select the next available date as the end date
      cy.get('button[aria-current="date"]')
        .invoke('attr', 'data-timestamp')
        .then((timestamp) => {
          // Convert timestamp to a Date object
          const currentDate = new Date(parseInt(timestamp, 10));

          // Add 10 days to the current date
          const newDate = addDays(currentDate, 10);

          // Convert back to timestamp
          const newTimestamp = newDate.getTime();

          // Click the next day's date
          cy.get(`button[data-timestamp="${newTimestamp}"]`).click({
            force: true,
          });
        });
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

    if (removeSchedule) {
      cy.log('Removing scheduled time for the job');
      // disable choose a fixed date and time checkbox
      cy.get('span[data-testid="schedule-dialog-fixed-date-switch"]')
        .invoke('hasClass', 'Mui-checked')
        .then((checkedClassPresent) => {
          if (checkedClassPresent) {
            cy.get('input[type="checkbox"]').check({force: true});
          }
        });
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
