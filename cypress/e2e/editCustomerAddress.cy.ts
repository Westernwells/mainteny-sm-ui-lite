import AppTopBarPage from '../pages/appTopBar.page';
import CustomerPage from '../pages/customer.page';

describe('Edit Customer Address', () => {
    beforeEach(() => {
        cy.login();

        const propertyOwners = `${Cypress.env().REACT_APP_API_URL}/api/propertyOwners?*`;
        cy.intercept('GET', propertyOwners).as('propertyOwnersApi');

        AppTopBarPage.selectLanguage('English');
        CustomerPage.visit();

        cy.wait('@propertyOwnersApi');
    });

    const editAddress = (type: 'billingAddress' | 'otherAddress' | 'beneficiaryAddress', address: Record<string, string>) => {
        cy.get('[data-testid="EditOutlinedIcon"]').eq(1).click();

        if (type === 'otherAddress') {
            cy.contains('button', 'Send invoice via').click();
        } else if (type === 'beneficiaryAddress') {
            cy.contains('button', 'Beneficiary address').click();
        }

        cy.log(`Editing ${type}`);

        cy.get(`input[name="${type}.component.name"]`).clear().type(address.name);
        cy.get(`input[name="${type}.component.street"]`).clear().type(address.street);
        cy.get(`input[name="${type}.component.street2"]`).clear().type(address.street2);
        cy.get(`input[name="${type}.component.postalCode"]`).clear().type(address.postalCode);
        cy.get(`input[name="${type}.component.city"]`).clear().type(address.city);

        cy.get(`div[id$="${type}.component.country"]`).click();
        cy.contains('li[role="option"]', address.country).click();

        cy.get(`div[id$="${type}.component.state"]`).click();
        cy.contains('li[role="option"]', address.state).click();

        cy.intercept('PUT', '**/api/propertyOwners/*').as('updateCustomer');
        cy.contains('button', 'Save').click();
        cy.wait('@updateCustomer', {timeout: 30000}).its('response.statusCode').should('eq', 200);

        cy.contains('Customer updated successfully', {timeout: 15000}).should('be.visible');

        cy.contains(address.name).should('be.visible');
        cy.contains(address.street).should('be.visible');
        cy.contains(address.city).should('be.visible');
    };

    it('should edit all customer address types', () => {
        cy.get('div[role="row"][aria-rowindex="2"]').first().click();
        cy.contains('Finance').should('be.visible');

        // Edit each address type
        editAddress('billingAddress', {
            name: 'Updated Billing Name',
            street: '456 Billing Street, Munich',
            street2: 'Suite 101',
            postalCode: '80331',
            city: 'Munich',
            country: 'Germany',
            state: 'Bavaria',
        });

        editAddress('otherAddress', {
            name: 'Updated Send Invoice via Name',
            street: '123 New Street, Berlin',
            street2: 'Floor 2',
            postalCode: '10115',
            city: 'Berlin',
            country: 'Germany',
            state: 'Berlin',
        });

        editAddress('beneficiaryAddress', {
            name: 'Updated Beneficiary Name',
            street: '789 Beneficiary Street, Hamburg',
            street2: 'PO Box 123',
            postalCode: '20095',
            city: 'Hamburg',
            country: 'Germany',
            state: 'Hamburg',
        });
    });
});
