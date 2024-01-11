import SettingsPage from '../pages/settings.page';
import LoginPage from '../pages/login.page';
import AppTopBarPage from '../pages/appTopBar.page';

describe('Settings page', () => {
    beforeEach(() => {
        LoginPage.visitLoginPage();
        const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
        cy.intercept('POST', loginURL).as('loginApi');
        LoginPage.login();

        cy.wait('@loginApi').then(() => {
            SettingsPage.visit();
            SettingsPage.changeTab(0);
            AppTopBarPage.selectLanguage('English');

        });
    });

    it('should render information cards', () => {
        cy.contains('Basic Information');
        cy.contains('Addresses');
        cy.contains('Settings');
        cy.contains('Billing Information');
    });

    it('navigate to checklist', () => {
        SettingsPage.changeTab(1);

        cy.url().should('eq', `${Cypress.config().baseUrl}/settings?tab=1`);
    });

    it('render new checklist button', () => {
        SettingsPage.changeTab(1);

        cy.get('[data-test-id="btn-test"]').click();
        cy.url().should('eq', `${Cypress.config().baseUrl}/settings/checklist/new`);
    });

    it('render Config Records', () => {
        cy.contains('Suppliers');
        cy.contains('Enabled');
    });

    it('open edit basic info', () => {

        cy.get('[data-test-id="basic-info"]').click();
        cy.contains('Edit Basic Information');
    });
});
