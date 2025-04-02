import {useMemo} from 'react';
import {Document, StyleSheet, View} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import {centsToMoney, formatCurrency} from 'utils/currency';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency, HeaderFooterInfoData} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {HtmlPDF} from 'components/HtmlPDF';
import {
  InvoiceAmountDetail,
  InvoiceItemView,
  InvoiceView,
} from 'models/invoice';
import {formatCostText} from 'utils/utils';
import {
  calculateArticlesAmount,
  getItemTotalAfterPerItemDiscount,
} from 'utils/calculate-total';
import {
  applyGlobalDiscountOnItems,
  applyPerItemDiscountOnItems,
  stripHtmlTags,
} from 'pages/InvoiceDetails/utils';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
import {ArticleType} from 'models/article';
import useCalculateLaborMaterialCost from 'hooks/useCalculateLaborMaterialCost';
import {allItemsHaveZeroDiscount} from 'utils/discount';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {getAddressComponentFromInvoice} from 'utils/pdfTemplates';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import PdfTemplateInvoiceDetails from './PdfTemplateInvoiceDetails';
import PdfPartialPaymentSection from './PdfPartialPaymentSection';
import PdfPageContainer from './containers/PdfPageContainer';
import PdfBodyContainer from './containers/PdfBodyContainer';
import TopSectionContainer from './containers/TopSectionContainer';
import PdfPageTitleHtml from './containers/PdfPageTitleHtml';
import {ArticleSection} from './ArticleSection/ArticleSection';
import SwissPageTemplate from './SwissPageTemplate';
import AlternativeAddressTemplate from './AlternativeAddressTemplate';

const getStyles = ({
  boldFontStyle,
  primaryColor,
  secondaryColor,
}: PdfConfigurationStyles) =>
  StyleSheet.create({
    contentBody: {
      marginTop: 6,
      marginBottom: 16,
      color: secondaryColor,
    },
    notesSection: {
      marginTop: 30,
    },
    sectionHeading: {
      fontSize: 10,
      padding: 0,
      lineHeight: 0,
      marginBottom: 6,
      color: primaryColor,
      ...boldFontStyle,
      marginTop: 15,
    },
  });

type Props = {
  translate: (key: string) => string;
  userInfo?: UserAccount | undefined;
  currentCurrency?: Currency;
  invoice: InvoiceView;
  invoiceAmountDetail?: InvoiceAmountDetail;
  previousInvoices: InvoiceView[];
  selectedLng?: string;
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
  nextCompanyExternalId?: string;
  qrImageSrc?: string;
  pdfConfigClientStorage: ClientReportForPDFConfig;
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const FinalInvoicePdfTemplate = ({
  translate,
  userInfo,
  currentCurrency,
  invoice,
  invoiceAmountDetail,
  selectedLng,
  previousInvoices,
  headerInfo,
  headerPath,
  footerInfo,
  footerPath,
  nextCompanyExternalId,
  qrImageSrc,
  pdfConfigClientStorage,
  fontStyles,
  primaryColor,
  secondaryColor,
}: Props) => {
  const articleItems = invoice?.items.map((item) => ({
    ...item,
    discount: getDiscoutObj(item?.additionalInfo?.discount),
  }));

  const itemsAfterPerItemDiscount = applyPerItemDiscountOnItems(articleItems);

  const itemsAfterGlobalDiscount = applyGlobalDiscountOnItems(
    itemsAfterPerItemDiscount,
    invoice.additionalInfo.discount,
  );

  const discount = getDiscoutObj(invoice?.additionalInfo?.discount);
  const discountAmount = discount?.amount;
  const discountValue = discountAmount?.value ?? 0;

  const netTotal = (articleItem: InvoiceItemView) => {
    const total = getItemTotalAfterPerItemDiscount({
      item: {
        unitAmount: {
          netAmount: articleItem?.unitAmount?.netAmount,
        },
        quantity: articleItem.quantity,
        discount: articleItem?.additionalInfo?.discount,
      },
      precision: 0,
    });
    return centsToMoney(currentCurrency?.code!, total);
  };

  const {amountAfterGlobalDiscount, vats, amountAfterGlobalDiscountWithVAT} =
    useMemo(
      () =>
        calculateArticlesAmount({
          items: articleItems,
          globalDiscount: discount,
        }),
      [articleItems, discount],
    );

  const amountAfterGlobalDiscountFormatted = formatCurrency(
    amountAfterGlobalDiscount,
    {
      currency: currentCurrency?.code,
      excludeCurrencySymbol: true,
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
    },
  );

  const laborCost = useCalculateLaborMaterialCost(
    itemsAfterGlobalDiscount,
    ArticleType.LABOR,
    currentCurrency,
  );
  const materialCost = useCalculateLaborMaterialCost(
    itemsAfterGlobalDiscount,
    ArticleType.MATERIAL,
    currentCurrency,
  );

  const serviceCompanyInfo = getServiceCompanyInfo(
    userInfo,
    invoice?.additionalInfo?.alternativeServiceCompanyInfo,
  );

  const styles = getStyles({
    boldFontStyle: fontStyles.bold,
    primaryColor,
    secondaryColor,
  });

  const customerVATId =
    (pdfConfigClientStorage.includeCustomerVAT &&
      invoice?.propertyOwner?.additionalInfo?.vatId) ||
    '';

  const eanValue = invoice?.propertyOwner.additionalInfo?.ean || '';

  return (
    <Document>
      {invoice?.additionalInfo.alternativeAddress &&
        Object.keys(invoice?.additionalInfo.alternativeAddress!).length !== 0 &&
        !!invoice?.additionalInfo.alternativeAddress.component?.name && (
          <AlternativeAddressTemplate
            userInfo={userInfo}
            translate={translate}
            headerInfo={headerInfo}
            headerPath={headerPath}
            footerInfo={footerInfo}
            footerPath={footerPath}
            alternativeServiceCompanyInfo={
              invoice?.additionalInfo.alternativeServiceCompanyInfo
            }
            alternativeAddress={invoice?.additionalInfo.alternativeAddress}
            fontStyles={fontStyles}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        )}

      <PdfPageContainer fontStyles={fontStyles} primaryColor={primaryColor}>
        <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

        <PdfBodyContainer>
          <TopSectionContainer>
            <PdfTemplateLeftAddress
              serviceCompanyInfo={serviceCompanyInfo}
              fallbackReceiverName={invoice?.propertyOwner?.name}
              addressComponent={getAddressComponentFromInvoice(invoice)}
              beneficiaryInfo={
                invoice?.additionalInfo.beneficiaryAddress?.component
              }
              translate={translate}
              customerVATId={customerVATId}
              eanValue={eanValue}
              fontStyles={fontStyles}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />

            <PdfTemplateInvoiceDetails
              userInfo={userInfo}
              translate={translate}
              invoice={invoice}
              nextCompanyExternalId={nextCompanyExternalId}
              pdfConfigClientStorage={pdfConfigClientStorage}
              fontStyles={fontStyles}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </TopSectionContainer>

          <View>
            <PdfPageTitleHtml
              value={invoice?.subject}
              fontStyles={fontStyles}
              primaryColor={primaryColor}
            />

            {invoice?.description.trim() !== '' && (
              <HtmlPDF
                html={invoice?.description || ''}
                rootStyle={styles.contentBody}
              />
            )}

            {invoice?.additionalInfo.showArticleSection &&
              invoice.items.length > 0 && (
                <ArticleSection
                  invoice={invoice}
                  currentCurrency={currentCurrency}
                  translate={translate}
                  allItemsHaveZeroDiscount={allItemsHaveZeroDiscount(
                    articleItems,
                  )}
                  discountValue={discountValue}
                  subtotalExclVatFormatted={amountAfterGlobalDiscountFormatted}
                  percentageVats={vats}
                  total={amountAfterGlobalDiscountWithVAT}
                  selectedLng={selectedLng}
                  netTotal={netTotal}
                  fontStyles={fontStyles}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              )}

            <PdfPartialPaymentSection
              translate={translate}
              selectedLng={selectedLng}
              invoice={invoice}
              invoiceAmountDetail={invoiceAmountDetail}
              currentCurrency={currentCurrency}
              previousInvoices={previousInvoices}
              articleItems={articleItems}
              fontStyles={fontStyles}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />

            {invoice?.additionalInfo?.moreInfo &&
              stripHtmlTags(invoice?.additionalInfo?.moreInfo) && (
                <View style={styles.notesSection}>
                  <HtmlPDF
                    html={formatCostText(
                      invoice?.additionalInfo?.moreInfo,
                      `${formatCurrency(laborCost, {
                        currency: currentCurrency?.code,
                        currencySymbol: currentCurrency?.symbol,
                        companyLang: selectedLng,
                      })}`,
                      `${formatCurrency(materialCost, {
                        currency: currentCurrency?.code,
                        currencySymbol: currentCurrency?.symbol,
                        companyLang: selectedLng,
                      })}`,
                    )}
                    rootStyle={{
                      marginTop: 6,
                      marginBottom: 16,
                    }}
                  />
                </View>
              )}
          </View>
        </PdfBodyContainer>

        <PdfTemplateFooter
          userInfo={userInfo}
          translate={translate}
          footerInfo={footerInfo}
          footerPath={footerPath}
          fontStyles={fontStyles}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      </PdfPageContainer>

      {userInfo?.serviceCompany.settings.invoiceQRCodeEnabled && (
        <SwissPageTemplate
          qrImageSrc={qrImageSrc}
          primaryColor={primaryColor}
        />
      )}
    </Document>
  );
};

export default FinalInvoicePdfTemplate;
