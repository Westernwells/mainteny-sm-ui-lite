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

        cy.get('[data-test-id="checklist"]').click();
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

    it('basic info. disable button when name is empty', () => {
        SettingsPage.changeModalInput('name', '', 'basic-info', true);
        const button = cy.get('button[type="submit"]');
        button.should('be.disabled');
    });

    it('basic info. disable button when email is empty', () => {
        SettingsPage.changeModalInput('email', '', 'basic-info', true);
        const button = cy.get('button[type="submit"]');
        button.should('be.disabled');
    });

    it('basic info. should not be disabled button when email is not empty', () => {
        SettingsPage.changeModalInput('email', 'some test', 'basic-info', false);
        const button = cy.get('button[type="submit"]');
        button.should('not.be.disabled');
    });

    it('basic info. submit basic info', () => {
        cy.get('[data-test-id="basic-info"]').click();
        cy.get('button[type="submit"]').click();
        cy.contains('Company updated successfully');
    });

    it('address. disable button when address is empty', () => {
        SettingsPage.changeModalInput('billingAddress', '', 'address-info', true);
        const button = cy.get('button[type="submit"]');
        button.should('be.disabled');
    });

    it('address. should not be disabled button when email is not empty', () => {
        SettingsPage.changeModalInput('billingAddress', 'test', 'address-info', false);
        const button = cy.get('button[type="submit"]');
        button.should('not.be.disabled');
    });

    it('address. submit address info', () => {
        cy.get('[data-test-id="address-info"]').click();
        cy.get('button[type="submit"]').click();
        cy.contains('Company updated successfully');
    });

    it('contract. delete contract', () => {
        cy.get('[data-test-id="delete-contract"]').click({ multiple: true, force: true });
        cy.contains('Remove defined contract name');
        cy.wait(100);
        cy.get('[data-test-id="remove"]').click({ multiple: true, force: true });
        cy.wait(100);
        cy.contains('Contract types updated successfully');
    });

});
