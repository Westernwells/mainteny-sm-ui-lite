import AppTopBarPage from '../pages/appTopBar.page';
import CustomerPage from '../pages/customer.page';

describe('Edit Customer Address', () => {
    beforeEach(() => {
        cy.login();

        const propertyOwners = `${Cypress.env().REACT_APP_API_URL}/api/propertyOwners?*`;
        cy.intercept('GET', propertyOwners).as('propertyOwnersApi');

        AppTopBarPage.selectLanguage('English');
        CustomerPage.visit();

        // Wait for the customer list to load
        cy.wait('@propertyOwnersApi');
    });

    it('should edit all customer address types', () => {
        // Click on the first customer in the list to navigate to customer details
        cy.get('div[role="row"][aria-rowindex="2"]').first().click();

        // Wait for customer details to load
        cy.contains('Finance').should('be.visible');

        // Click on edit button in the Finance widget
        cy.get('[data-testid="EditOutlinedIcon"]').eq(1).click();

        // 1. Edit the billing address
        cy.log('Editing billing address');
        cy.get('input[name="billingAddress.component.name"]').clear().type('Updated Billing Name');
        cy.get('input[name="billingAddress.component.street"]').clear().type('456 Billing Street, Munich');
        cy.get('input[name="billingAddress.component.street2"]').clear().type('Suite 101');
        cy.get('input[name="billingAddress.component.postalCode"]').clear().type('80331');
        cy.get('input[name="billingAddress.component.city"]').clear().type('Munich');
        cy.get('div[id$="billingAddress.component.country"]').click();
        cy.contains('li[role="option"]', 'Germany').click();
        cy.get('div[id$="billingAddress.component.state"]').click();
        cy.contains('li[role="option"]', 'Bavaria').click();

        // Save changes for billing address
        cy.contains('button', 'Save').click();

        // Verify success message
        cy.contains('Customer updated successfully').should('be.visible');

        // Verify the updated billing address is displayed
        cy.contains('Updated Billing Name').should('be.visible');
        cy.contains('456 Billing Street').should('be.visible');
        cy.contains('Munich').should('be.visible');

        // Click on edit button again for the next address type
        cy.get('[data-testid="EditOutlinedIcon"]').eq(1).click();

        // 2. Edit the send invoice via address
        cy.log('Editing send invoice via address');
        cy.contains('button', 'Send invoice via').click();
        cy.get('input[name="otherAddress.component.name"]').clear().type('Updated Send Invoice via Name');
        cy.get('input[name="otherAddress.component.street"]').clear().type('123 New Street, Berlin');
        cy.get('input[name="otherAddress.component.street2"]').clear().type('Floor 2');
        cy.get('input[name="otherAddress.component.postalCode"]').clear().type('10115');
        cy.get('input[name="otherAddress.component.city"]').clear().type('Berlin');
        cy.get('div[id$="otherAddress.component.country"]').click();
        cy.contains('li[role="option"]', 'Germany').click();
        cy.get('div[id$="otherAddress.component.state"]').click();
        cy.contains('li[role="option"]', 'Berlin').click();

        // Save changes for send invoice via address
        cy.contains('button', 'Save').click();

        // Verify success message
        cy.contains('Customer updated successfully').should('be.visible');

        // Verify the updated address is displayed
        cy.contains('Updated Send Invoice via Name').should('be.visible');
        cy.contains('123 New Street').should('be.visible');
        cy.contains('Berlin').should('be.visible');

        // Click on edit button again for the next address type
        cy.get('[data-testid="EditOutlinedIcon"]').eq(1).click();

        // 3. Edit the beneficiary address
        cy.log('Editing beneficiary address');
        cy.contains('button', 'Beneficiary address').click();
        cy.get('input[name="beneficiaryAddress.component.name"]').clear().type('Updated Beneficiary Name');
        cy.get('input[name="beneficiaryAddress.component.street"]').clear().type('789 Beneficiary Street, Hamburg');
        cy.get('input[name="beneficiaryAddress.component.street2"]').clear().type('PO Box 123');
        cy.get('input[name="beneficiaryAddress.component.postalCode"]').clear().type('20095');
        cy.get('input[name="beneficiaryAddress.component.city"]').clear().type('Hamburg');
        cy.get('div[id$="beneficiaryAddress.component.country"]').click();
        cy.contains('li[role="option"]', 'Germany').click();
        cy.get('div[id$="beneficiaryAddress.component.state"]').click();
        cy.contains('li[role="option"]', 'Hamburg').click();

        // Save changes for beneficiary address
        cy.contains('button', 'Save').click();

        // Verify success message
        cy.contains('Customer updated successfully').should('be.visible');

        // Verify the updated beneficiary address is displayed
        cy.contains('Updated Beneficiary Name').should('be.visible');
        cy.contains('789 Beneficiary Street').should('be.visible');
        cy.contains('Hamburg').should('be.visible');
    });
});
