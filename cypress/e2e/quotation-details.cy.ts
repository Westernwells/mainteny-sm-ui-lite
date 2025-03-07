import AppTopBarPage from '../pages/appTopBar.page';
import QuotationPage from '../pages/quotation.page';
import QuotationsPage from '../pages/quotations.page';

describe('Quotation Details', () => {
    beforeEach(() => {
        cy.login();
        AppTopBarPage.selectLanguage('English');
        cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`).as('serviceCompanyApi');
        QuotationPage.visit();
        cy.wait('@serviceCompanyApi');
        cy.get('span[role="progressbar"]').should('not.exist');
    });

    describe('should download', () => {
        beforeEach(() => {
            cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/media/signedUrl/download*`).as('downloadedPDF');
        });

        it('from primary action', () => {
            cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`).as('getAcceptedQuotations');
            QuotationsPage.filterQuotationTableByStatus('Accepted');
            QuotationPage.navigateToFirstQuotation('@getAcceptedQuotations');

            cy.get('button[data-testid="primary-button"]')
              .contains('Download')
              .should('not.be.disabled')
              .click();

            QuotationPage.verifyDownloadedPDF();
        });

        it('from top right download quotation action', () => {
            cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`).as('getAcceptedQuotations');
            QuotationsPage.filterQuotationTableByStatus('Accepted');
            QuotationPage.navigateToFirstQuotation('@getAcceptedQuotations');

            cy.contains('Download Quotation').should('be.visible').click();
            QuotationPage.verifyDownloadedPDF();
        });

        it('from action menu', () => {
            cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`).as('getDraftQuotations');
            QuotationsPage.filterQuotationTableByStatus('Draft');
            QuotationPage.navigateToFirstQuotation('@getDraftQuotations');

            cy.get('div[class^="react-pdf__Page__textContent"]')
              .should('exist')
              .then(() => {
                  cy.get('svg[data-testid="MoreVertIcon"]').eq(0).click();
                  cy.get('ul[role="menu"]', {timeout: 3000})
                    .should('be.visible')
                    .find('li[role="menuitem"]')
                    .contains('Download')
                    .should('not.be.disabled')
                    .click({force: true});

                  QuotationPage.verifyDownloadedPDF();
              });
        });
    });
});