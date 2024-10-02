import AppTopBarPage from '../pages/appTopBar.page';
import ArticlesPage from '../pages/articles-details.page';

describe('Edit Article', () => {
    beforeEach(() => {
        cy.login();

        const articleApi = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/articles?query=&pageIndex=0&pageSize=50`;

        const articleInfoURL = `${Cypress.env().REACT_APP_API_URL}/api/articles/*`;

        cy.intercept('GET', articleApi).as('articleApi');
        cy.intercept('GET', articleInfoURL).as('articleInfoApi');

        ArticlesPage.visit();
        AppTopBarPage.selectLanguage('English');
        ArticlesPage.navigateToDetailsPage();
    });

    it('should validate article details', () => {
        ArticlesPage.openArticleDialog('Edit Basic Information', 0);
        const outside = cy.get('#alert-dialog-title');

        // Validate article name is filled
        cy.clearRichTextField('Name');
        outside.click();
        cy.get('div[data-test-id="name"]').contains('Name is required');
        cy.get('button[type="button"]').should('be.disabled');

        // Validate purchase VAT is filled
        cy.get('input[name="unitPurchaseVat"]').clear();
        outside.click();
        cy.get('input[name="unitPurchaseVat"]').parent().siblings('p').should('have.text', 'Purchase VAT is required');
        cy.get('button[type="button"]').should('be.disabled');

        // Validate selling VAT is filled
        cy.get('input[name="unitSellingVat"]').clear();
        outside.click();
        cy.get('input[name="unitSellingVat"]').parent().siblings('p').should('have.text', 'Selling VAT is required');
        cy.get('button[type="button"]').should('be.disabled');

        // Validate purchase VAT is at least 0
        cy.get('input[name="unitPurchaseVat"]').clear().type('-1', {force: true}).blur();
        outside.click();
        cy.get('input[name="unitPurchaseVat"]').parent().siblings('p').should('have.text', 'unitPurchaseVat must be greater than or equal to 0');
        cy.get('button[type="button"]').should('be.disabled');

        // Validate selling VAT is at least 0
        cy.get('input[name="unitSellingVat"]').clear().type('-1', {force: true}).blur();
        outside.click();
        cy.get('input[name="unitSellingVat"]').parent().siblings('p').should('have.text', 'unitSellingVat must be greater than or equal to 0');
        cy.get('button[type="button"]').should('be.disabled');

        // Validate purchase VAT is not more than 100
        cy.get('input[name="unitPurchaseVat"]').clear().type('101', {force: true}).blur();
        outside.click();
        cy.get('input[name="unitPurchaseVat"]').parent().siblings('p').should('have.text', 'unitPurchaseVat must be less than or equal to 100');
        cy.get('button[type="button"]').should('be.disabled');

        // Validate selling VAT is not more than 100
        cy.get('input[name="unitSellingVat"]').clear().type('101', {force: true}).blur();
        outside.click();
        cy.get('input[name="unitSellingVat"]').parent().siblings('p').should('have.text', 'unitSellingVat must be less than or equal to 100');
        cy.get('button[type="button"]').should('be.disabled');
    });

    it('should show delete article modal with its content and delete article', () => {
        cy.wait('@articleInfoApi')
            .its('response')
            .then((response) => {
                const {body: articleData} = response;
                cy.wait(1500);
                const isDeleteVisible = articleData.canDelete;
                if (isDeleteVisible) {
                    ArticlesPage.openDeleteArticleModal();
                    cy.get('#alert-dialog-title').should('contain', 'Delete');
                    cy.get('#alert-dialog-description').should('contain', 'Do you want to delete this article?');
                    cy.get('[data-test-id="remove"]').should('contain', 'Yes');
                    ArticlesPage.deleteArticle();
                }
            });
    });

    it('should edit article description', () => {
        cy.wait('@articleInfoApi')
            .its('response')
            .then((response) => {
                const {body: articleData} = response;
                cy.wait(1500);
                const hasDescription = articleData.description;
                if (!hasDescription) {
                    cy.contains('No description yet. Please click the button below to add!');
                }
            });

        ArticlesPage.openArticleDialog('Edit Description', 1);
        ArticlesPage.saveArticleDetail('Article updated successfully.');
    });

    it('should edit article stock information', () => {
        ArticlesPage.openArticleDialog('Edit Stock Information', 2);
        ArticlesPage.saveArticleDetail('Article updated successfully.');
    });

    it('should edit article supplier information', () => {
        ArticlesPage.openArticleDialog('Edit Suppliers Information', 3);
        ArticlesPage.saveArticleDetail('Supplier updated successfully.');
    });

    it('should edit article attachments information', () => {
        cy.wait('@articleInfoApi')
            .its('response')
            .then((response) => {
                const {body: articleData} = response;
                cy.wait(1500);

                if (!articleData?.additionalInfo?.pictures) {
                    cy.contains('No attachments yet. Please click the button below to add!');
                }
            });

        ArticlesPage.openArticleDialog('Add Attachments', 4);
        cy.wait(200);
        cy.contains('button', 'Upload attachment').should('be.visible').should('be.disabled');
    });

    it('should edit article qr code information', () => {
        cy.wait('@articleInfoApi')
            .its('response')
            .then((response) => {
                const {body: articleData} = response;
                cy.wait(1500);
                if (!articleData?.additionalInfo?.qrCode) {
                    cy.contains('No QR code yet. Please click the button below to add!');
                }
            });

        ArticlesPage.openArticleDialog('Edit QR Code', 5);
        cy.get('button:contains("Save")').should('be.visible').should('be.disabled');
    });
});
