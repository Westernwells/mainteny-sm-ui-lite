import {Document, StyleSheet, Text, View} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import {useMemo} from 'react';
import {centsToMoney, formatCurrency} from 'utils/currency';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency, HeaderFooterInfoData} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {HtmlPDF} from 'components/HtmlPDF';
import {
  EditableInvoiceItem,
  InvoiceAmountDetail,
  InvoiceView,
} from 'models/invoice';
import {formatCostText} from 'utils/utils';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
import {
  buildInvoicePayment,
  getFormattedPaymentValues,
  replacePaymentTermsPlaceholders,
} from 'utils/invoice';
import {ArticleType} from 'models/article';
import {
  applyGlobalDiscountOnItems,
  applyPerItemDiscountOnItems,
  stripHtmlTags,
} from 'pages/InvoiceDetails/utils';
import useCalculateLaborMaterialCost from 'hooks/useCalculateLaborMaterialCost';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {getAddressComponentFromInvoice} from 'utils/pdfTemplates';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import {ServiceCompanyItem} from 'models/service-company';
import PdfTemplateInvoiceDetails from './PdfTemplateInvoiceDetails';
import {ArticleSection} from './ArticleSection/ArticleSection';
import PdfPageContainer from './containers/PdfPageContainer';
import PdfBodyContainer from './containers/PdfBodyContainer';
import TopSectionContainer from './containers/TopSectionContainer';
import PdfPageTitleHtml from './containers/PdfPageTitleHtml';
import SwissPageTemplate from './SwissPageTemplate';
import AlternativeAddressTemplate from './AlternativeAddressTemplate';

const getStyles = ({
  boldFontStyle,
  regularFontStyle,
  primaryColor,
  secondaryColor,
}: PdfConfigurationStyles) =>
  StyleSheet.create({
    page: {
      ...regularFontStyle,
      fontSize: 10,
      paddingTop: 25,
      paddingLeft: 68,
      paddingRight: 45,
      backgroundColor: 'white',
      height: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      justifyContent: 'space-between',
      paddingBottom: 95,
      color: primaryColor,
    },
    topSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 40,
      alignItems: 'flex-start',
      marginTop: 5,
    },
    rightAddress: {
      flex: '0 0 42%',
      display: 'flex',
      flexDirection: 'column',
    },
    rightAddressContent: {
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 6,
    },
    tag: {
      ...boldFontStyle,
      fontSize: 9,
      color: primaryColor,
      flex: '0 0 43%',
    },
    tagContent: {
      fontSize: 9,
      color: secondaryColor,
      flex: '0 0 57%',
      textAlign: 'right',
      ...regularFontStyle,
    },
    dataBody: {
      borderBottom: '1px solid #212121',
    },
    contentBody: {
      marginTop: 6,
      marginBottom: 16,
    },
    paymentTermsSection: {
      marginTop: 5,
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
    sectionBody: {
      fontSize: 10,
      color: secondaryColor,
      display: 'flex',
      flexDirection: 'column',
      paddingVertical: 1.5,
    },
  });

type Props = {
  serviceCompany?: ServiceCompanyItem;
  translate: (key: string) => string;
  userInfo?: UserAccount | undefined;
  currentCurrency?: Currency;
  invoice?: InvoiceView;
  invoiceAmountDetail?: InvoiceAmountDetail;
  selectedLng?: string;
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
  nextCompanyExternalId?: string;
  qrImageSrc?: string;
  pdfConfigClientStorage: ClientReportForPDFConfig;
  invoiceItems: EditableInvoiceItem[];
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const FullInvoicePdfTemplate = ({
  serviceCompany,
  translate,
  userInfo,
  currentCurrency,
  invoice,
  invoiceAmountDetail,
  selectedLng,
  headerInfo,
  headerPath,
  footerInfo,
  footerPath,
  nextCompanyExternalId,
  qrImageSrc,
  pdfConfigClientStorage,
  invoiceItems,
  fontStyles,
  primaryColor,
  secondaryColor,
}: Props) => {
  const discount = invoice?.additionalInfo?.discount;

  const articleItems = invoice?.items.map((item, index) => ({
    ...item,
    payment: buildInvoicePayment(invoiceAmountDetail, index, currentCurrency),
    discount: getDiscoutObj(item?.additionalInfo?.discount),
  }))!;

  const itemsAfterPerItemDiscount = applyPerItemDiscountOnItems(articleItems);

  const itemsAfterGlobalDiscount = applyGlobalDiscountOnItems(
    itemsAfterPerItemDiscount,
    discount,
  );

  const grossInvoiceAmount = centsToMoney(
    currentCurrency?.code!,
    invoiceAmountDetail?.amountAfterGlobalDiscount.grossAmount,
  );

  const formattedPaymentValues = useMemo(() => {
    if (
      invoice?.additionalInfo.paymentTerm?.term &&
      invoice &&
      invoiceAmountDetail
    ) {
      return getFormattedPaymentValues(
        invoice.additionalInfo.paymentTerm,
        invoice,
        invoiceAmountDetail,
        grossInvoiceAmount,
        currentCurrency,
      );
    }
    return [];
  }, [invoice, invoiceAmountDetail, invoice?.additionalInfo.paymentTerm?.term]);

  const replacedPaymentTerms = replacePaymentTermsPlaceholders(
    invoice?.additionalInfo.paymentTerm?.term || '',
    formattedPaymentValues ?? [],
    currentCurrency!,
    selectedLng,
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
    regularFontStyle: fontStyles.regular,
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
              serviceCompany={serviceCompany}
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
              pdfConfigClientStorage={pdfConfigClientStorage}
              translate={translate}
              invoice={invoice}
              nextCompanyExternalId={nextCompanyExternalId}
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
              selectedLng={selectedLng}
            />

            {invoice?.description.trim() !== '' && (
              <HtmlPDF
                html={invoice?.description || ''}
                rootStyle={styles.contentBody}
                selectedLng={selectedLng}
              />
            )}

            {invoiceItems.length > 0 && (
              <ArticleSection
                invoice={invoice}
                invoiceItems={invoiceItems}
                invoiceAmountDetail={invoiceAmountDetail}
                currentCurrency={currentCurrency}
                translate={translate}
                selectedLng={selectedLng}
                fontStyles={fontStyles}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            )}

            {invoice?.additionalInfo.paymentTerm?.term?.trim() && (
              <View style={styles.paymentTermsSection}>
                <Text style={styles.sectionHeading}>
                  {translate('Payment terms')}
                </Text>
                <HtmlPDF
                  html={replacedPaymentTerms}
                  rootStyle={{
                    marginTop: 6,
                    marginBottom: 16,
                  }}
                  selectedLng={selectedLng}
                />
              </View>
            )}

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
                    selectedLng={selectedLng}
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

export default FullInvoicePdfTemplate;
