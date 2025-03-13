import EmployeesPage from '../pages/employees.page';
import AppTopBarPage from '../pages/appTopBar.page';

describe('Employees page - list page', () => {
    beforeEach(() => {
        cy.login().then(() => {
            AppTopBarPage.selectLanguage('English');

            const employeesAPI = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/users?*`;
            cy.intercept('GET', employeesAPI).as('employeesAPI');

            const technicianEventsAPI = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/technicianEvents?*`;
            cy.intercept('GET', technicianEventsAPI).as('technicianEventsAPI');

            EmployeesPage.visit();
            cy.get('span[role="progressbar"]').should('not.exist');
            cy.wait('@employeesAPI');
            cy.wait('@technicianEventsAPI');
        });
    });

    it('employee availability status is showing correctly', () => {
        EmployeesPage.getAvailableEmployeeRowIndex().then((i) => {
            EmployeesPage.getEmployeeByIndex(i).click();
            cy.get('span[role="progressbar"]').should('not.exist');
            cy.wait('@employeesAPI');
            EmployeesPage.addHoliday();
            EmployeesPage.verifyHoliday();

            // check if employee is availability is updated on employees listing page
            cy.go('back'); // go back to employees listing page
            cy.get('span[role="progressbar"]').should('not.exist');
            cy.wait('@employeesAPI');
            cy.wait('@technicianEventsAPI');
            EmployeesPage.checkEmployeeAvailabilityUpdated(i);

            // clean up - remove holiday
            EmployeesPage.removeHoliday(i);
        });
    });

    it('employee availabilty status is showing correctly on employees listing 2nd page', () => {
        cy.get('svg[data-testid="KeyboardArrowRightIcon"]').click();
        cy.wait('@employeesAPI');
        cy.wait(300); // Very small delay for the DOM to be updated, can be anything any small amount

        EmployeesPage.getAvailableEmployeeRowIndex().then((i) => {
            EmployeesPage.getEmployeeByIndex(i).click();
            cy.get('span[role="progressbar"]').should('not.exist');
            cy.wait('@employeesAPI');
            EmployeesPage.addHoliday();
            EmployeesPage.verifyHoliday();

            // check if employee is availablity is updated on employees listing page
            cy.go('back'); // go back to employees listing page
            cy.get('span[role="progressbar"]').should('not.exist');
            cy.wait('@employeesAPI');
            cy.wait('@technicianEventsAPI');
            EmployeesPage.checkEmployeeAvailabilityUpdated(i);

            // clean up - remove holiday
            EmployeesPage.removeHoliday(i);
        });
    });
});
