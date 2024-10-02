import AppTopBarPage from '../pages/appTopBar.page';
import QuotationPage from '../pages/quotation.page';

describe('Create Quotation', () => {
    beforeEach(() => {
        cy.login();
        cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`).as('serviceCompanyApi');

        AppTopBarPage.selectLanguage('English');

        QuotationPage.visit();
        QuotationPage.openNewQuotation();
        cy.get('span[role="progressbar"]').should('not.exist');
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

        cy.clearRichTextField('Subject');
        cy.clearRichTextField('Description');

        cy.contains('button', 'Save').should('be.disabled');

        cy.get('[data-testid="AddArticle"]').should('exist');
        cy.contains('button', 'Save').should('be.disabled');

        cy.get('[data-testid="AddArticle"]').click({force: true});

        cy.get('div[test-id="name-0"]').click({force: true});
        // click outside
        cy.contains('Footer').click();

        cy.contains('Article cannot be empty');
        cy.contains('button', 'Save').should('be.disabled');
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

    it('should check payment terms are adding properly', () => {
        const getRichTextField = () => cy.get('div[data-testid="payment-terms-rich-text-field"]');
        const openPaymentTermsDialog = () => getRichTextField().find('svg[data-testid="TextSnippetIcon"]').click();

        // check payment terms without discount
        openPaymentTermsDialog();
        cy.get('div[role="presentation"] label:has(p:only-child)')
            .first()
            .click()
            .then(($label) => {
                const paymentTerm = $label.text();
                cy.contains('button', 'Confirm').click();
                getRichTextField().find('div[role="textbox"]').invoke('text').should('contain', paymentTerm);
            });

        // check payment terms with discount
        openPaymentTermsDialog();
        cy.get('div[role="presentation"] label:has(p:nth-of-type(3))')
            .first()
            .click()
            .then(($label) => {
                cy.contains('button', 'Confirm').click();

                const paymentTermName = $label.find('h6').text();
                const discount1 = $label.find('p').eq(0).text();
                const discount2 = $label.find('p').eq(1).text();
                const discounts = [discount1, discount2].map((d) => {
                    const [days, discountPercentage] = d.split(';').map((part) => part.trim().split(' ')[0]);
                    return {days, discountPercentage};
                });

                const discountsText = discounts
                    .map(
                        ({days, discountPercentage}) =>
                            `If payment is made within ${days} days, we grant a discount of ${discountPercentage} of the invoice amount.`,
                    )
                    .join('\n');

                getRichTextField().find('div[role="textbox"]').invoke('text').should('contain', `${paymentTermName}\n${discountsText}`);
            });
    });
});
