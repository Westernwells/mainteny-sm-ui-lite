import AppTopBarPage from '../pages/appTopBar.page';
import QuotationPage from '../pages/quotation.page';
import QuotationsPage from '../pages/quotations.page';

describe('Quotation Details', () => {
    beforeEach(() => {
        cy.login();
        cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`).as('serviceCompanyApi');

        AppTopBarPage.selectLanguage('English');

        QuotationPage.visit();
        cy.get('span[role="progressbar"]').should('not.exist');
    });

    describe('should download', () => {
        beforeEach(() => {
            cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/media/signedUrl/download*`).as('downloadedPDF');
        });

        it('from primary action', () => {
            QuotationsPage.filterQuotationTableByStatus('Accepted');
            QuotationsPage.navigateToDetailsPage(0);
            cy.wait('@downloadedPDF'); // wait to load the pdf file
            cy.wait(5000); // wait for rerender to update the button
            cy.get('button[data-testid="primary-button"]').should('contain', 'Download');
            cy.get('button[data-testid="primary-button"]').click();

            QuotationPage.getQuotationNumberElement()
                .invoke('text')
                .then((text) => {
                    cy.log(text);
                    QuotationPage.checkForDownloadedPDF(text);
                });
        });

        it('from top right download quotation action', () => {
            QuotationsPage.filterQuotationTableByStatus('Accepted');
            QuotationsPage.navigateToDetailsPage(0);
            cy.wait('@downloadedPDF'); // wait to load the pdf file
            cy.wait(5000); // wait for rerender to update the button
            cy.contains('Download Quotation').should('exist');
            cy.contains('Download Quotation').click();

            QuotationPage.getQuotationNumberElement()
                .invoke('text')
                .then((text) => {
                    cy.log(text);
                    QuotationPage.checkForDownloadedPDF(text);
                });
        });

        it('from action menu', () => {
            QuotationsPage.filterQuotationTableByStatus('Draft');
            QuotationsPage.navigateToDetailsPage(0);
            cy.wait('@downloadedPDF'); // wait to load the pdf file
            cy.wait(5000); // wait for rerender to update the button
            cy.get('svg[data-testid="MoreVertIcon"]').eq(0).click();
            cy.contains('Download').should('exist');
            cy.contains('Download').click({force: true});

            QuotationPage.getQuotationNumberElement()
                .invoke('text')
                .then((text) => {
                    cy.log(text);
                    QuotationPage.checkForDownloadedPDF(text);
                });
        });
    });
});
