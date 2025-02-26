import AppTopBarPage from '../pages/appTopBar.page';
import ContactPage from '../pages/contact.page';
import {getUniqueId} from '../../src/utils/utils';

describe('Create Contact', () => {
    beforeEach(() => {
        cy.login();
        AppTopBarPage.selectLanguage('English');
        ContactPage.visit();
    });

    it('should create contact and assign it to a unit and a customer', () => {
        // create new contact
        cy.contains('button', 'Contact').click();
        const uniqueId = getUniqueId();
        const firstName = `First${uniqueId}`;
        const lastName = 'Last';
        const fullName = `${firstName} ${lastName}`;
        cy.get('input[name="userAccount.firstName"]').type(firstName);
        cy.get('input[name="userAccount.lastName"]').type(lastName);
        cy.get('div[role="combobox"][aria-labelledby$="contactPerson.roles"]').click();
        cy.get('li[role="option"][data-value="CONTACT_PERSON"]').click();
        cy.get('input[name="userAccount.contact.email"]').type(`${firstName}@example.com`);
        const contactPersonsAPI = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/contactPersons?*`;
        cy.intercept('GET', contactPersonsAPI).as('contactPersonsAPI');
        cy.contains('button', 'Confirm').click();
        cy.wait('@contactPersonsAPI', {timeout: 120000}).its('response').should('have.property', 'statusCode').and('eq', 200);
        cy.contains('Contact person created successfully');

        // open contact person details
        const contactPersonsAssociationsAPI = `${Cypress.env().REACT_APP_API_URL}/api/contactPersons/*/associations?*`;
        cy.intercept('GET', contactPersonsAssociationsAPI).as('contactPersonsAssociationsAPI');
        cy.get('td[role="cell"][data-field="NAME"]').contains(fullName).click();
        cy.wait('@contactPersonsAssociationsAPI');

        // assign contact to unit
        cy.contains('button', 'New connection').click();
        cy.get('div[role="combobox"][aria-labelledby^="connection-type-select-label"]').click();
        cy.get('li[role="option"][data-value="ELEVATOR"]').click();
        const unitsAPI = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/elevators?*`;
        cy.intercept('GET', unitsAPI).as('unitsAPI');
        cy.get('input[id="asynchronous-demo-refId"]').next().click();
        cy.wait('@unitsAPI');
        cy.get('li[role="option"][id="asynchronous-demo-refId-option-0"]').click();
        cy.contains('button', 'Confirm').click();
        cy.wait('@contactPersonsAssociationsAPI');
        cy.contains('Connection successfully added');

        // assign contact to customer
        cy.get('svg[data-testid="AddOutlinedIcon"]').click();
        cy.get('div[role="combobox"][aria-labelledby^="connection-type-select-label"]').click();
        cy.get('li[role="option"][data-value="PROPERTY_OWNER"]').click();
        const customersAPI = `${Cypress.env().REACT_APP_API_URL}/api/propertyOwners?*`;
        cy.intercept('GET', customersAPI).as('customersAPI');
        cy.get('input[id="asynchronous-demo-customerId"]').next().click();
        cy.wait('@customersAPI');
        cy.get('li[role="option"][id="asynchronous-demo-customerId-option-0"]').click();
        cy.contains('button', 'Confirm').click();
        cy.wait('@contactPersonsAssociationsAPI');
        cy.contains('Connection successfully added');

        // cleanup
        // close contact details
        cy.get('body').click(0, 0);
        // open actions
        cy.get('td[role="cell"][data-field="NAME"]').contains(fullName).parents('tr[role="row"]').find('svg[data-testid="MoreVertIcon"]').click();
        // delete contact
        cy.contains('li', 'Delete').click();
        const deleteContactPersonAPI = `${Cypress.env().REACT_APP_API_URL}/api/contactPersons/*`;
        cy.intercept('DELETE', deleteContactPersonAPI).as('deleteContactPersonAPI');
        cy.contains('button', 'Yes').click();
        cy.wait('@deleteContactPersonAPI');
        cy.contains('Contact person deleted successfully');
    });

    it('should be able to submit with entered mandatory fields', () => {
        // create new contact
        cy.contains('button', 'Contact').click();
        const uniqueId = getUniqueId();
        const firstName = `First${uniqueId}`;
        const lastName = 'Last';
        cy.get('input[name="userAccount.firstName"]').type(firstName);
        cy.get('input[name="userAccount.lastName"]').type(lastName);
        cy.get('div[role="combobox"][aria-labelledby$="contactPerson.roles"]').click();
        cy.get('li[role="option"][data-value="CONTACT_PERSON"]').click();
        cy.get('input[name="userAccount.contact.email"]').type(`${firstName}@example.com`);
        cy.contains('button', 'Confirm').should('not.be.disabled');
    });

    it('should be able to submit with entered optional field "First Name"', () => {
        // create new contact
        cy.contains('button', 'Contact').click();
        const lastName = 'Last';
        cy.get('input[name="userAccount.lastName"]').type(lastName);
        cy.get('div[role="combobox"][aria-labelledby$="contactPerson.roles"]').click();
        cy.get('li[role="option"][data-value="CONTACT_PERSON"]').click();
        cy.get('input[name="userAccount.contact.email"]').click();
        cy.contains('button', 'Confirm').should('not.be.disabled');
    });

    it('should not be able to submit without mandatory fields "Last Name"', () => {
        // create new contact
        cy.contains('button', 'Contact').click();
        const uniqueId = getUniqueId();
        const firstName = `First${uniqueId}`;
        cy.get('input[name="userAccount.firstName"]').type(firstName);
        cy.get('div[role="combobox"][aria-labelledby$="contactPerson.roles"]').click();
        cy.get('li[role="option"][data-value="CONTACT_PERSON"]').click();
        cy.get('input[name="userAccount.contact.email"]').type(`${firstName}@example.com`);
        cy.contains('button', 'Confirm').should('be.disabled');
    });

    it('should not be able to submit without mandatory fields "Role"', () => {
        // create new contact
        cy.contains('button', 'Contact').click();
        const lastName = 'Last';
        cy.get('input[name="userAccount.lastName"]').type(lastName);
        cy.contains('button', 'Confirm').should('be.disabled');
    });
});
