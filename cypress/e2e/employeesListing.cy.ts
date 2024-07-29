import EmployeesPage from '../pages/employees.page';
import AppTopBarPage from '../pages/appTopBar.page';

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
        EmployeesPage.setAvailableEmployeeRowIndex();
        cy.get<string>('@availableEmployeeRowIndex').then((i) => {
            EmployeesPage.getEmployeeByIndex(i).click();
        });
        EmployeesPage.addHoliday();
        EmployeesPage.verifyHoliday();

        // check if employee is availablity is updated on employees listing page
        cy.go('back'); // go back to employees listing page
        cy.wait('@employeesAPI');
        cy.wait('@technicianEventsAPI');
        cy.get<string>('@availableEmployeeRowIndex').then((i) => {
            EmployeesPage.checkEmployeeAvailabilityUpdated(i);

            // clean up - remove holiday
            EmployeesPage.removeHoliday(i);
        });
    });

    it('employee availabilty status is showing correctly on employees listing 2nd page', () => {
        cy.get('button[aria-label="Go to next page"]').click();
        cy.get("span[role='progressbar']").should('exist');
        cy.wait('@employeesAPI');
        cy.get("span[role='progressbar']").should('not.exist');
        cy.wait(300); // Very small delay for the DOM to be updated, can be anything any small amount

        EmployeesPage.setAvailableEmployeeRowIndex();
        cy.get<string>('@availableEmployeeRowIndex').then((i) => {
            EmployeesPage.getEmployeeByIndex(i).click();
        });
        EmployeesPage.addHoliday();
        EmployeesPage.verifyHoliday();

        // check if employee is availablity is updated on employees listing page
        cy.go('back'); // go back to employees listing page
        cy.wait('@employeesAPI');
        cy.wait('@technicianEventsAPI');
        cy.get<string>('@availableEmployeeRowIndex').then((i) => {
            EmployeesPage.checkEmployeeAvailabilityUpdated(i);

            // clean up - remove holiday
            EmployeesPage.removeHoliday(i);
        });
    });
});
