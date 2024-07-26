import EmployeesPage from '../pages/employees.page';
import AppTopBarPage from '../pages/appTopBar.page';
import {formatDate} from '../../src/utils/datetime';

describe('Employees page - list page', () => {
    beforeEach(() => {
        cy.login();

        AppTopBarPage.selectLanguage('English');

        const employeesAPI = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/users?*`;
        cy.intercept('GET', employeesAPI).as('employeesAPI');

        const technicianEventsAPI = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/technicianEvents?*`;
        cy.intercept('GET', technicianEventsAPI).as('technicianEventsAPI');

        EmployeesPage.visit();
        cy.wait('@employeesAPI');
        cy.wait('@technicianEventsAPI');
    });

    it('employee availabilty status is showing correctly', () => {
        cy.get('div[data-field="availability"][role="cell"]')
            .contains('Available')
            .parents('div[role="row"]')
            .invoke('attr', 'data-rowindex')
            .then((index) => {
                cy.wrap(index).as('availableEmployeeRowIndex');
            });

        cy.get('@availableEmployeeRowIndex').then((i) => {
            cy.get(`div[data-rowindex=${i}]`).click();
        });

        // add holiday
        cy.get('svg[data-testid="AddIcon"]').click();
        cy.get('svg[data-testid="WbSunnyIcon"]').click();
        cy.contains('label', 'Date').click();
        cy.get('button[aria-current="date"]').click();
        cy.contains('button', 'Confirm').click();
        const currentTechnicianAPI = `${Cypress.env().REACT_APP_API_URL}/api/technicians/*/events?*`;
        cy.intercept('GET', currentTechnicianAPI).as('currentTechnicianAPI');
        cy.contains('button', 'Save').click();
        cy.contains('Absence created successfully!');
        cy.wait('@currentTechnicianAPI');
        // check if holiday is added
        const absenceCard = () => cy.contains('Absence').parents('div.MuiPaper-root');
        absenceCard().contains('Holiday');
        absenceCard().contains(/\d+ days/); // 1 days
        absenceCard().contains(formatDate(new Date()));

        // check if employee is availablity is updated on employees listing page
        cy.go('back'); // go back to employees listing page
        cy.wait('@employeesAPI');
        cy.wait('@technicianEventsAPI');
        cy.get('@availableEmployeeRowIndex').then((i) => {
            cy.get(`div[data-rowindex=${i}]`).contains('Holiday').should('exist');

            // clean up - remove holiday
            cy.get(`div[data-rowindex=${i}]`).click();
            cy.wait('@currentTechnicianAPI');
            cy.get('svg[data-testid="DeleteIcon"]').first().click();
            cy.contains('button', 'Yes').click();
            cy.wait('@currentTechnicianAPI');
        });
    });
});
