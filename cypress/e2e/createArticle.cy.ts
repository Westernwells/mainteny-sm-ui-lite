import { ArticleType } from "../../src/models/article";
import AppTopBarPage from "../pages/appTopBar.page";
import ArticlesPage from "../pages/articles.page";
import LoginPage from "../pages/login.page";
import { ArticleBasicFormModel, ArticleDescriptionFormModel, ArticleStockFormModel } from '../../src/models/articleForm'
import { getUniqueId } from "../../src/utils/utils";

interface ICreateArticleForm {
	firstStep: ArticleBasicFormModel;
	secondStep: ArticleDescriptionFormModel;
	thirdStep: ArticleStockFormModel;
}
const validArticle:ICreateArticleForm = {
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
		unitPurchaseAmount: "300",
		unitSellingAmount: "500"
	},
	secondStep: {
		description: 'Test Description',
	},
	thirdStep: {
		suppliers: [],
		currentStock: 5,
		maxStock: 10,
		minOrderQuantity: 1,
		minStock: 0
	},
}

describe('Create Article', () => {
	beforeEach(() => {
    LoginPage.visitLoginPage();
    const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
    cy.intercept('POST', loginURL).as('loginApi');
    LoginPage.login();

    cy.wait('@loginApi').then(() => {
      AppTopBarPage.selectLanguage('English');

			const articleSuppliersURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/articleSuppliers?*`;
			cy.intercept('GET', articleSuppliersURL).as('articleSuppliersApi');

			ArticlesPage.visit();
    });
  });

	it('should create article', () => {
		ArticlesPage.navigateTo('new');

		ArticlesPage.fillBasicDetails(validArticle.firstStep);
		ArticlesPage.goNext();

		ArticlesPage.fillDescription(validArticle.secondStep);
		ArticlesPage.goNext();

		cy.wait('@articleSuppliersApi', {timeout: 15000})
    .its('response')
		.then((response) => {
			const {body: {data: suppliers}} = response;
			const firstSupplier = suppliers.find((supplier:any) => supplier?.name);
			if(firstSupplier){
				ArticlesPage.fillStockDetails(validArticle.thirdStep);

				ArticlesPage.chooseSupplier(firstSupplier.name);

				ArticlesPage.saveArticle();
				cy.contains('Article created successfully');
			}
		});
	});
});