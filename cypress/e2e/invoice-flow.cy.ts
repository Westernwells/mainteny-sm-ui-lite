import {ServiceCompany} from 'models/service-company';
import {ServiceOrderTypeKeys, ServiceOrderView} from 'models/service-order';
import {PropertyOwnerView} from 'models/propertyManager';
import {DiscountType, InvoiceAmountDetail, InvoiceView} from 'models/invoice';
import {ArticleType} from 'models/article';
import {fixRounding, formatAddressFullname, formatCostText, getRandomIntInRange, removeControlCharsAndSpaces} from 'utils/utils';
import {getPlainStringFromHtml, isPlainString} from 'utils/rich-field-string';
import {formatDate} from 'utils/datetime';
import {getDisplayDeliveryDate, getFormattedPaymentValues, netTotal, replacePaymentTermsPlaceholders} from 'utils/invoice';
import {centsToMoney, formatCurrency, formatGrossAmount} from 'utils/currency';
import {calculateArticlesAmount} from 'utils/calculate-total';
import {calculateLaborMaterialCost} from 'hooks/useCalculateLaborMaterialCost';
import {applyGlobalDiscountOnItems, applyPerItemDiscountOnItems} from 'pages/InvoiceDetails/utils';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
import AppTopBarPage from '../pages/appTopBar.page';
import OrdersPage from '../pages/orders.page';
import NewServiceJobPage from '../pages/new-service.page';
import {randomEnumKey} from '../utils/utils';

describe('Invoice flow', () => {
    beforeEach(() => {
        const getServiceCompany = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`;
        cy.intercept('GET', getServiceCompany).as('getServiceCompany');
        cy.login();
        AppTopBarPage.selectLanguage('English');
    });

    it('should test full invoice type flow', () => {
        // create job
        OrdersPage.visit();
        cy.waitForSpinnerToDisappear();
        cy.contains('button', 'New Job').click();
        const randomJobType = randomEnumKey(ServiceOrderTypeKeys);
        cy.contains('li', randomJobType).click();
        cy.waitForSpinnerToDisappear();
        cy.get('[role="cell"]').first().click();
        cy.contains('button', 'Next').click();
        NewServiceJobPage.selectADueDate();
        NewServiceJobPage.selectADateTimeAndTechnician();
        cy.contains('button', 'Next').click();
        cy.contains('button', 'Submit').click();
        cy.contains('Order scheduled successfully');

        // create invoice
        cy.get('[data-testid="add-invoice"]').click();
        cy.contains('label', 'Full Invoice').click();
        const getJobAPI = `${Cypress.env().REACT_APP_API_URL}/api/serviceOrders/*`;
        cy.intercept('GET', getJobAPI).as('getJobAPI');
        const getCustomerAPI = `${Cypress.env().REACT_APP_API_URL}/api/propertyOwners/*`;
        cy.intercept('GET', getCustomerAPI).as('getCustomerAPI');
        cy.contains('button', 'Create').click();

        // assert Header section
        cy.get('div[role="textbox"][id="subject"]').contains('Full Invoice');

        // assert Address information section
        cy.wait('@getServiceCompany').then((interception) => {
            const serviceCompany = interception.response.body as ServiceCompany;
            cy.contains(serviceCompany.name);

            // assert Footer section
            cy.contains('Labor costs without VAT: {LABOR_COST}');
            cy.contains('Material costs without VAT: {MATERIAL_COST}');

            // assert Payment terms
            const getPaymentTermsField = () => cy.get('div[data-testid="payment-terms-rich-text-field"]');
            const openPaymentTermsDialog = () => getPaymentTermsField().find('svg[data-testid="TextSnippetIcon"]').click();
            // check payment terms without discount
            openPaymentTermsDialog();
            cy.get('div[role="presentation"] label:has(p:only-child)')
                .first()
                .click()
                .then(($label) => {
                    const paymentTerm = $label.text();
                    cy.contains('button', 'Confirm').click();
                    getPaymentTermsField().find('div[role="textbox"]').invoke('text').should('contain', paymentTerm);
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
                        const [, discountPercentage] = d.split(';').map((part) => part.trim().split(' ')[0]);
                        return {discountPercentage};
                    });

                    const discountsText = discounts
                        .map(
                            ({discountPercentage}) =>
                                `If you pay before {DUE_DATE} we grant ${discountPercentage} discount ({DISCOUNT_AMOUNT}) based on {INVOICE_AMOUNT}. Payment amount: {PAYMENT_AMOUNT}`,
                        )
                        .join('\n');

                    getPaymentTermsField().find('div[role="textbox"]').invoke('text').should('contain', `${paymentTermName}\n${discountsText}`);
                });
        });
        cy.wait('@getCustomerAPI').then((interception) => {
            const customer = interception.response.body as PropertyOwnerView;
            cy.get('input[name="propertyOwnerId"]').should('have.value', customer.name);
            if (customer.billingAddress) {
                cy.contains(formatAddressFullname(customer.billingAddress)?.fullName);
            }
            if (customer.beneficiaryAddress) {
                cy.contains(formatAddressFullname(customer.beneficiaryAddress)?.fullName);
            }
            if (customer.otherAddress) {
                cy.contains(formatAddressFullname(customer.otherAddress)?.fullName);
            }
        });
        cy.wait('@getJobAPI').then((interception) => {
            const job = interception.response.body as ServiceOrderView;
            cy.contains(job.externalId);
            // assert articles section
            // validate articles are filled from job
            if (!job.articles.length) {
                cy.contains('button', 'Save').should('be.disabled');
                // add article
                cy.contains('button', 'Add Article').click();
                cy.get('div[test-id="name-0"]').click();
                const articlesTable = cy.get('table[aria-label="articles table"]');
                // clicking second row because first row is table header
                const secondRow = articlesTable.find('tr').eq(2);
                secondRow.click();

                cy.get('input[name="quantity"]')
                    .clear()
                    .type(`${getRandomIntInRange(1, 5)}`);
                cy.get('input[name="unitAmount.netAmount"]')
                    .clear()
                    .type(`{selectAll}${getRandomIntInRange(10, 100)}`);
            } else {
                job.articles.forEach((a, index) => {
                    cy.get(`tr[data-rbd-draggable-id="${index}${a.article.id}"]`).within(() => {
                        cy.get(`div[test-id^="name-"]`).should(($el) => {
                            const elementText = removeControlCharsAndSpaces($el.text());
                            const expectedText = removeControlCharsAndSpaces(isPlainString(a.name) ? a.name : getPlainStringFromHtml(a.name));
                            expect(elementText).to.contain(expectedText);
                        });
                        const capitalizedArticleType = a.article.type.charAt(0).toUpperCase() + a.article.type.slice(1).toLowerCase();
                        cy.get(`div[aria-label="${capitalizedArticleType}"]`);
                        cy.get('input[name="unitAmount.netAmount"]')
                            .invoke('attr', 'value')
                            .should('eq', (a.unitAmount.netAmount / 100).toLocaleString());
                        cy.get('input[name="quantity"]').invoke('attr', 'value').should('eq', `${a.quantity}`);

                        // This Test for tax needs to be updated
                        cy.get('div[aria-labelledby^="select-tax-label"]').click();
                        cy.document().its('body').find('li[role="option"]').contains(`%`).click();

                        // input some values to assert later on
                        cy.get('input[name="quantity"]')
                            .clear()
                            .type(`${getRandomIntInRange(1, 5)}`);
                        cy.get('input[name="unitAmount.netAmount"]')
                            .clear()
                            .type(`{selectAll}${getRandomIntInRange(10, 100)}`);
                    });
                });
            }
        });

        const getInvoiceAmount = `${Cypress.env().REACT_APP_API_URL}/api/invoices/*/amount/`;
        cy.intercept('GET', getInvoiceAmount).as('getInvoiceAmount');
        const getInvoice = `${Cypress.env().REACT_APP_API_URL}/api/invoices/*`;
        cy.intercept('GET', getInvoice).as('getInvoice');
        cy.contains('button', 'Save').click();
        cy.contains('Invoice created successfully');

        // compare PDF content with invoice data coming from API
        cy.wait('@getInvoice').then((interception) => {
            const invoice = interception.response.body as InvoiceView;

            cy.contains('Loading PDF').should('exist');
            cy.contains('Loading PDF').should('not.exist');

            // assert Invoice details page
            cy.contains('Automatically assigned');
            cy.contains('Full invoice');
            cy.contains(formatGrossAmount(invoice.totalAmount));
            if (invoice.serviceOrder?.externalId) {
                cy.contains(invoice.serviceOrder.externalId);
            }

            // assert PDF content
            // eslint-disable-next-line prefer-arrow-callback
            cy.get('div[class^="react-pdf__Document"]')
                .first()
                .within(() => {
                    cy.contains(invoice.serviceCompany.name);
                    // assert Address section
                    if (invoice.additionalInfo?.alternativeAddress?.component?.name) {
                        cy.contains(invoice.additionalInfo.alternativeAddress.component.name);
                    }
                    if (invoice.additionalInfo?.alternativeAddress?.component?.street) {
                        cy.contains(invoice.additionalInfo.alternativeAddress.component.street);
                    }
                    if (invoice.additionalInfo?.alternativeAddress?.component?.street2) {
                        cy.contains(invoice.additionalInfo.alternativeAddress.component.street2);
                    }
                    if (invoice.additionalInfo?.billingAddress?.component?.name) {
                        cy.contains(invoice.additionalInfo.billingAddress.component.name);
                    }
                    if (invoice.additionalInfo?.billingAddress?.component?.street) {
                        cy.contains(invoice.additionalInfo.billingAddress.component.street);
                    }
                    if (invoice.additionalInfo?.billingAddress?.component?.street2) {
                        cy.contains(invoice.additionalInfo.billingAddress.component.street2);
                    }
                    if (invoice.additionalInfo?.beneficiaryAddress?.component?.name) {
                        cy.contains(invoice.additionalInfo.beneficiaryAddress.component.name);
                    }
                    if (invoice.additionalInfo?.beneficiaryAddress?.component?.street) {
                        cy.contains(invoice.additionalInfo.beneficiaryAddress.component.street);
                    }
                    if (invoice.additionalInfo?.beneficiaryAddress?.component?.street2) {
                        cy.contains(invoice.additionalInfo.beneficiaryAddress.component.street2);
                    }

                    // assert invoice details
                    cy.contains('Automatically assigned');
                    cy.contains(formatDate(new Date()));
                    if (invoice.dueDate) {
                        cy.contains(formatDate(invoice.dueDate));
                    }
                    if (invoice.meta.creator?.firstName && invoice.meta.creator?.lastName) {
                        cy.contains(`${invoice.meta.creator.firstName} ${invoice.meta.creator.lastName}`);
                    }
                    if (invoice.propertyOwner?.externalId) {
                        cy.contains(invoice.propertyOwner.externalId);
                    }
                    if (invoice.serviceOrder?.meta.createdAt) {
                        cy.contains(formatDate(invoice.serviceOrder.meta.createdAt));
                    }
                    if (invoice.additionalInfo?.purchaseOrderNumber) {
                        cy.contains(invoice.additionalInfo.purchaseOrderNumber);
                    }
                    if (invoice.additionalInfo?.costCenter) {
                        cy.contains(invoice.additionalInfo.costCenter);
                    }
                    if (invoice.serviceOrder?.externalId) {
                        cy.contains(invoice.serviceOrder.externalId);
                    }
                    const startDate = invoice?.additionalInfo.deliveryStartDate;
                    const endDate = invoice?.additionalInfo.deliveryEndDate;
                    const displayDeliveryDate = getDisplayDeliveryDate(startDate, endDate);
                    if (displayDeliveryDate) {
                        cy.contains(displayDeliveryDate);
                    }
                    if (invoice.additionalInfo?.elevatorExternalId) {
                        cy.contains(invoice.additionalInfo.elevatorExternalId);
                    } else if (invoice.serviceOrder?.elevator?.externalId) {
                        cy.contains(invoice.serviceOrder.elevator.externalId);
                    }

                    // assert invoice subject
                    cy.contains(isPlainString(invoice.subject) ? invoice.subject : getPlainStringFromHtml(invoice.subject));

                    // assert articles section
                    cy.wait('@getServiceCompany').then((i) => {
                        const serviceCompany = i.response.body as ServiceCompany;
                        const {settings, language: companyLang} = serviceCompany;
                        const {
                            currencies: [firstCurrency],
                        } = settings;
                        const {code: currency, symbol: currencySymbol} = firstCurrency;
                        const formatCurrencyWithOptions = (
                            num: number,
                            options?: Intl.NumberFormatOptions & {
                                roundingMode?: 'floor' | 'ceil' | 'trunc' | undefined;
                                excludeCurrencySymbol?: boolean;
                                currencySymbol?: string;
                                companyLang?: string;
                            },
                        ) =>
                            formatCurrency(num, {
                                currency,
                                excludeCurrencySymbol: true,
                                currencySymbol,
                                companyLang,
                                ...options,
                            });
                        invoice.items.forEach((a) => {
                            cy.contains(isPlainString(a.name) ? a.name : getPlainStringFromHtml(a.name));
                            cy.contains(a.quantity);
                            cy.contains(formatCurrencyWithOptions(centsToMoney(currency, a.unitAmount.netAmount) || 0));
                            cy.contains(formatCurrencyWithOptions(netTotal(a, currency)));
                        });
                        const discount = getDiscoutObj(invoice?.additionalInfo?.discount);
                        const {amountAfterGlobalDiscount, vats, amountAfterGlobalDiscountWithVAT} = calculateArticlesAmount({
                            items: invoice.items,
                            globalDiscount: discount,
                        });
                        const amountAfterGlobalDiscountFormatted = formatCurrencyWithOptions(amountAfterGlobalDiscount);
                        cy.contains(amountAfterGlobalDiscountFormatted);
                        vats.forEach((v) => {
                            cy.contains(`${v.percentageVat}%`);
                            cy.contains(
                                formatCurrencyWithOptions(fixRounding(v.vat, 2), {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                    roundingMode: 'floor',
                                }),
                            );
                        });
                        cy.contains(formatCurrencyWithOptions(amountAfterGlobalDiscountWithVAT));

                        // assert payment terms section
                        if (invoice?.additionalInfo.paymentTerm?.term) {
                            cy.wait('@getInvoiceAmount').then((ad) => {
                                const invoiceAmountDetail = ad.response.body as InvoiceAmountDetail;
                                const grossInvoiceAmount = centsToMoney(currency, invoiceAmountDetail?.amountAfterGlobalDiscount?.grossAmount);
                                const formattedPaymentValues = invoiceAmountDetail
                                    ? getFormattedPaymentValues(
                                          invoice.additionalInfo.paymentTerm,
                                          invoice,
                                          invoiceAmountDetail,
                                          grossInvoiceAmount,
                                          firstCurrency,
                                      )
                                    : [];
                                const replacedPaymentTerms = replacePaymentTermsPlaceholders(
                                    invoice?.additionalInfo?.paymentTerm?.term || '',
                                    formattedPaymentValues || [],
                                    firstCurrency,
                                    companyLang,
                                );
                                if (replacedPaymentTerms) {
                                    cy.root().should(($el) =>
                                        expect(removeControlCharsAndSpaces($el.text())).to.contain(
                                            removeControlCharsAndSpaces(
                                                isPlainString(replacedPaymentTerms)
                                                    ? replacedPaymentTerms
                                                    : getPlainStringFromHtml(replacedPaymentTerms),
                                            ),
                                        ),
                                    );
                                }
                            });
                        }

                        // assert Notes section
                        if (invoice?.additionalInfo?.moreInfo) {
                            const itemsAfterPerItemDiscount = applyPerItemDiscountOnItems(invoice.items);
                            const itemsAfterGlobalDiscount = applyGlobalDiscountOnItems(itemsAfterPerItemDiscount, discount);
                            const laborCost = calculateLaborMaterialCost(itemsAfterGlobalDiscount, ArticleType.LABOR, currency);
                            const materialCost = calculateLaborMaterialCost(itemsAfterGlobalDiscount, ArticleType.MATERIAL, currency);
                            const notesText = formatCostText(
                                invoice?.additionalInfo?.moreInfo,
                                `${formatCurrency(laborCost, {
                                    currency,
                                    currencySymbol,
                                    companyLang,
                                })}`,
                                `${formatCurrency(materialCost, {
                                    currency,
                                    currencySymbol,
                                    companyLang,
                                })}`,
                            );
                            cy.root().should(($el) =>
                                expect(removeControlCharsAndSpaces($el.text())).to.contain(
                                    removeControlCharsAndSpaces(isPlainString(notesText) ? notesText : getPlainStringFromHtml(notesText)),
                                ),
                            );
                        }
                    });
                });
        });

        /* assert discounts */
        cy.get('[data-testid="bottom-drawer"]').find('button svg[data-testid="MoreVertIcon"]').click();
        cy.contains('li', 'Edit').click();
        // remove all articles
        cy.wait('@getInvoice');
        cy.wait(5000);
        const deleteAllFoundArticles = (rowCount: number) => {
            if (rowCount < 1) return;
            cy.get('table[aria-label="articles section table"] [data-testid="DeleteIcon"]').first().click();
            deleteAllFoundArticles(rowCount - 1);
        };
        cy.get('table[aria-label="articles section table"] [data-testid="DeleteIcon"]').then((rows) => deleteAllFoundArticles(rows.length));
        // add articles
        const mockArticles = [
            {
                name: 'Article 1',
                unitAmount: {
                    netAmount: 100000,
                    percentageVat: 7,
                },
                quantity: 1,
                discount: {
                    type: DiscountType.PERCENTAGE,
                    percentage: 10,
                },
            },
            {
                name: 'Article 2',
                unitAmount: {
                    netAmount: 200000,
                    percentageVat: 7,
                },
                quantity: 2,
                discount: {
                    type: DiscountType.AMOUNT,
                    amount: {
                        value: 500,
                    },
                },
            },
            {
                name: 'Article 3',
                unitAmount: {
                    netAmount: 200000,
                    percentageVat: 19,
                },
                quantity: 2,
                discount: {
                    type: DiscountType.PERCENTAGE,
                    percentage: 15,
                },
            },
        ];
        mockArticles.forEach((a, index) => {
            cy.contains('button', 'Add Article').click();
            cy.get(`tr[data-rbd-draggable-id^="${index}"]`).within(() => {
                cy.get(`div[test-id^="name-"]`).click();
                // select article - clicking second row because first row is table header
                cy.document().its('body').find('table[aria-label="articles table"] tr').eq(2).click();
                const isMac = Cypress.platform === 'darwin';
                cy.get('div[contenteditable="true"]')
                    .first()
                    .focus()
                    .click()
                    .wait(1000)
                    .realPress(isMac ? ['Meta', 'A'] : ['Control', 'A'])
                    // .realType('{del}')
                    .realPress('Delete')
                    .realType(`${a.name}`);
                cy.get('input[name="quantity"]').clear().type(`{selectAll}${a.quantity}`);
                cy.get('input[name="unitAmount.netAmount"]')
                    .clear()
                    .type(`{selectAll}${a.unitAmount.netAmount / 100}`);

                // This Test for tax needs to be updated
                cy.get('div[aria-labelledby^="select-tax-label"]').click();
                cy.document().its('body').find('li[role="option"]').contains(`%`).click();

                if (a.discount.type === DiscountType.AMOUNT) {
                    cy.get('input[name="discount"').parent().find('button').click();
                    cy.get('input[name="discount"]').clear().type(`{selectAll}${a.discount.amount.value}`);
                } else {
                    cy.get('input[name="discount"]').clear().type(`{selectAll}${a.discount.percentage}`);
                }
            });
        });
        // add global discount
        const globalDiscount = {
            type: DiscountType.AMOUNT,
            amount: {
                value: 500,
            },
        };
        cy.contains('button', 'Add Discount').click();
        cy.get('input[name="globalDiscount"]').clear().type(`{selectAll}${globalDiscount.amount.value}`);
        // assert calculations
        const sumBeforeGlobalDiscount = '7,800.00';
        const sumAfterGlobalDiscount = '7,300.00';
        // Vat test needs to be updated since logic for handling has changed
        const vats = ['VAT 10%', '730.00'];
        const total = '8,030.00';
        [sumBeforeGlobalDiscount, sumAfterGlobalDiscount, ...vats, total].forEach((value) => cy.contains(value));
        cy.contains('button', 'Save').click();

        
        cy.get('div[class^="react-pdf__Page__textContent"]')
        .should('exist')
        .then(() => {
            cy.get('div[class^="react-pdf__Document"]')
            .first()
            .within(() => {
                [sumAfterGlobalDiscount, ...vats, total].forEach((value) => cy.contains(value));
            });
        });
        
        cy.contains(total);

        /* assert Download PDF */
        cy.go('back');
        // Also needs to be updated later due to VAT logic change
        cy.contains('€8,030.00').parents('div[role="row"]').find('svg[data-testid="MoreVertIcon"]').click();
        cy.contains('li', 'Download').click();
        cy.window().then((win) => {
            cy.spy(win.URL, 'createObjectURL').as('createObjectURLSpy');
        });
        cy.get('@createObjectURLSpy').should('have.been.called');
        cy.wait(5000);
        cy.task('downloads', 'cypress/downloads').then((d: string[]) => {
            const lastDownlodedFile = d[d.length - 1];
            cy.task('readPdf', `cypress/downloads/${lastDownlodedFile}`).its('text').should('contain', '8,030.00');
        });
    });
});