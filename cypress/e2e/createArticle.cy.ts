import {ArticleType} from '../../src/models/article';
import AppTopBarPage from '../pages/appTopBar.page';
import ArticlesPage from '../pages/articles.page';
import ArticlesPageDetails from '../pages/articles-details.page';
import {ArticleBasicFormModel, ArticleDescriptionFormModel, ArticleStockFormModel} from '../../src/models/articleForm';
import {getUniqueId} from '../../src/utils/utils';

interface ICreateArticleForm {
    firstStep: ArticleBasicFormModel;
    secondStep: ArticleDescriptionFormModel;
    thirdStep: ArticleStockFormModel;
}

const validArticle: ICreateArticleForm = {
    firstStep: {
        name: 'Test Article',
        externalId: getUniqueId(),
        category: 'Test Category',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        unitPurchaseVat: 20,
        unitSellingVat: 30,
        unitPurchaseAmountCurrency: 'EUR',
        unitSellingAmountCurrency: 'EUR',
        unit: 'kg',
        storageLocation: 'Test Location',
        type: ArticleType.MATERIAL,
        unitPurchaseAmount: '300',
        unitSellingAmount: '500',
    },
    secondStep: {
        description: 'Test Description',
    },
    thirdStep: {
        suppliers: [],
        currentStock: 5,
        maxStock: 10,
        minOrderQuantity: 1,
        minStock: 0,
    },
};

describe('Create Article', () => {
    beforeEach(() => {
        cy.login();

        AppTopBarPage.selectLanguage('English');

        const articlesURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/articles?*`;
        cy.intercept('GET', articlesURL).as('articlesAPI');
        const articleSuppliersURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/articleSuppliers?*`;
        cy.intercept('GET', articleSuppliersURL).as('articleSuppliersAPI');

        ArticlesPage.visit();
        cy.wait('@articlesAPI');
    });

    it('should create article', () => {
        cy.contains('button', 'New Article').click();

        ArticlesPage.fillBasicDetails(validArticle.firstStep);
        ArticlesPage.goNext();

        ArticlesPage.fillDescription(validArticle.secondStep);
        ArticlesPage.goNext();

        cy.wait('@articleSuppliersAPI')
            .its('response')
            .then((response) => {
                const {
                    body: {data: suppliers},
                } = response;
                const firstSupplier = suppliers.find((supplier: any) => supplier?.name);
                if (firstSupplier) {
                    ArticlesPage.fillStockDetails(validArticle.thirdStep);

                    ArticlesPage.chooseSupplier(firstSupplier.name);

                    ArticlesPage.saveArticle();
                    cy.contains('Article created successfully');
                }
            });
    });

    it('should order article', () => {
        ArticlesPageDetails.navigateToDetailsPage();
        cy.contains('button', 'Order Article').click();

        cy.contains('Select Supplier').click();
        cy.contains('Select Supplier');
        cy.contains('SUP00002').click();

        cy.fillRichTextField('Description', 'Test Description');

        const supplierArticleNumber = getUniqueId();
        cy.get('div[data-testid="supplier-article-number"]').clear().type(supplierArticleNumber);
        const createArticleOrderAPI = `${Cypress.env().REACT_APP_API_URL}/api/articleOrders`;
        cy.intercept('POST', createArticleOrderAPI).as('createArticleOrderAPI');
        const articleOrderAPI = `${Cypress.env().REACT_APP_API_URL}/api/articleOrders/*`;
        cy.intercept('GET', articleOrderAPI).as('articleOrderAPI');
        cy.contains('button', 'Save').click();
        cy.wait('@createArticleOrderAPI');
        cy.contains('PDF generation is in progress');
        cy.wait('@articleOrderAPI');

        // check PDF content
        cy.get('div[class^="react-pdf__Page__textContent"]').contains(supplierArticleNumber);

        // check print function
        cy.get('button').contains('Print order').click();

        cy.get('iframe')
            .should('exist')
            .its('0.contentWindow')
            .then((contentWindow) => {
                cy.stub(contentWindow, 'print').as('printSpy');
            });

        cy.get('@printSpy').should('have.been.called');
        // check downloaded PDF file content
        cy.task('downloads', 'cypress/downloads').then((d: string[]) => {
            const lastDownlodedFile = d[d.length - 1];
            cy.task('readPdf', `cypress/downloads/${lastDownlodedFile}`).its('text').should('contain', supplierArticleNumber);
        });
    });
});
