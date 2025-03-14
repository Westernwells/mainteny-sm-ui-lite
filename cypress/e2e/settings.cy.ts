import SettingsPage from '../pages/settings.page';
import AppTopBarPage from '../pages/appTopBar.page';

describe('Settings page', () => {
    beforeEach(() => {
        cy.login().then(() => {
            AppTopBarPage.selectLanguage('English');
            SettingsPage.visit();
            cy.get('span[role="progressbar"]').should('not.exist');
        });
    });

    it('navigate to checklist and render new checklist page', () => {
        cy.get('li div[role="button"]').contains('Checklists').click();
        cy.contains('button', 'New Checklist').click();
        cy.contains('Start adding components');
    });

    it('render Config Records', () => {
        cy.contains('Suppliers')
            .parents('div[class*="MuiGrid-container"]')
            .contains(/Enabled|Disabled/);
    });

    it('test edit basic info modal', () => {
        cy.get('svg[data-testid="EditOutlinedIcon"]').eq(1).click();

        cy.get('input[name="email"]')
            .invoke('val')
            .then((originalEmail: string) => {
                cy.get('input[name="email"]').clear();
                cy.get('button[type="submit"]').should('be.disabled');
                cy.get('input[name="email"]').type('invalid');
                cy.get('button[type="submit"]').should('be.disabled');
                cy.get('input[name="name"]').click();
                cy.get('input[name="email"]').parent().siblings('p').should('have.text', 'Enter a valid email');
                cy.get('input[name="email"]').clear().type(originalEmail);
                cy.contains('Enter a valid email').should('not.exist');
                cy.get('button[type="submit"]').should('not.be.disabled');
            });

        cy.get('input[name="name"]')
            .invoke('val')
            .then((originalName: string) => {
                cy.get('input[name="name"]').clear();
                cy.get('button[type="submit"]').should('be.disabled');

                cy.get('input[name="name"]').type(originalName);
                cy.get('button[type="submit"]').should('not.be.disabled');
            });

        // submit
        cy.get('button[type="submit"]').click();
        cy.contains('Company updated successfully');
    });
});
