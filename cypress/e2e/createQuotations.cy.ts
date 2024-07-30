import {addDays} from 'date-fns';
import AppTopBarPage from '../pages/appTopBar.page';
import LoginPage from '../pages/login.page';
import QuotationPage from '../pages/quotation.page';

describe('Create Quotation', () => {
    beforeEach(() => {
        LoginPage.visitLoginPage();
        const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
        cy.intercept('POST', loginURL).as('loginApi');
        LoginPage.login();

        cy.wait('@loginApi').then(() => {
            AppTopBarPage.selectLanguage('English');

            const addressURL = 'https://maps.googleapis.com/maps/api/place/js/AutocompletionService.GetPredictionsJson?*';

            cy.intercept('GET', addressURL).as('addressURLApi');

            QuotationPage.visit();
            QuotationPage.openNewQuotation();
        });
    });

    it('should add new customer on quotation page', () => {
        QuotationPage.addNewCustomer();
    });

    it('should create new unit on quotation page', () => {
        QuotationPage.addNewUnit();
    });

    it('should disable button if required fields are not filled', () => {
        cy.get('#combo-box-demo').should('have.value', '');
        cy.contains('button', 'Save').should('be.disabled');

        cy.contains('Select Unit');
        cy.contains('button', 'Save').should('be.disabled');

        cy.get('input[name="subject"]').clear({force: true});
        cy.get('textarea[name="description"]').click({force: true});
        cy.get('input[name="subject"]').parent().siblings('p').should('have.text', 'Subject is required');

        cy.contains('button', 'Save').should('be.disabled');

        cy.get('[data-test-id="AddArticle"]').should('exist');
        cy.contains('button', 'Save').should('be.disabled');

        cy.get('[data-test-id="AddArticle"]').click({force: true});

        const outside = cy.get('input[name="name"]');
        cy.get('input[name="name"]').click({force: true});
        outside.click({force: true});

        cy.contains('Article cannot be empty');
        cy.contains('button', 'Save').should('be.disabled');
    });

    it('should check expiry date is prefilled with 14 days from today', () => {
        cy.get('input[name="expiryDate"]').should('have.value', addDays(new Date(), 14).toLocaleDateString());
    });

    it('should create job from quotation page', () => {
        // create quotation //
        // select customer
        cy.get('input[role="combobox"][name="propertyOwnerId"]').parent().click();
        cy.get(`li[role="option"][id="combo-box-demo-option-0"]`).click();

        // add article
        cy.contains('button', 'Add Article').click();
        cy.get('div[test-id="name-0"]').click();
        const articlesTable = cy.get('table[aria-label="articles table"]');
        // clicking second row because first row is table header
        const secondRow = articlesTable.find('tr').eq(2);
        secondRow.click();

        cy.get('input[name="quantity"]').clear().type('1');
        cy.get('input[name="unitAmount.netAmount"]').clear().type('100');

        cy.contains('button', 'Save').click();
        cy.contains('Quotation created successfully');

        // send quotation //
        const sendQuotationAPI = `${Cypress.env().REACT_APP_API_URL}/api/quotations/*/send`;
        cy.intercept('POST', sendQuotationAPI).as('sendQuotationAPI');
        cy.contains('Send').click();
        cy.contains('label', 'Send to').click();
        cy.focused().type('noman+1@mainteny.com{enter}');
        cy.get('div[contenteditable="true"]').type('I am Text!');
        cy.contains('button', 'Send email').click();
        cy.wait('@sendQuotationAPI');
        cy.contains('Quotation sent successfully');

        // create job //
        const createJobAPI = `${Cypress.env().REACT_APP_API_URL}/api/serviceOrders`;
        cy.intercept('POST', createJobAPI).as('createJobAPI');
        cy.contains('Create Job').click();
        const getUnitsAPI = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/elevators?*`;
        cy.intercept('GET', getUnitsAPI).as('getUnitsAPI');
        cy.contains('Select Unit').click();
        cy.wait('@getUnitsAPI');
        cy.get('div[data-rowindex="0"]').click();
        cy.contains('button', 'Select').click();
        cy.get('div[role="combobox"][id="createServiceOrder"]').click();
        cy.get('li[data-value="Regular"]').click();
        cy.contains('Create').click();
        cy.contains('New Maintenance Job');
        cy.contains('Next').click();
        cy.contains('Submit').click();
        cy.wait('@createJobAPI');
        cy.contains('Order scheduled successfully');
    });
});
