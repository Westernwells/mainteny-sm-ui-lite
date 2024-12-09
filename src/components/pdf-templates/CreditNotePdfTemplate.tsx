import {Document, Text, View, StyleSheet, Font} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import {useMemo} from 'react';
import {centsToMoney, formatCurrency} from 'utils/currency';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency, HeaderFooterInfoData} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {HtmlPDF} from 'components/HtmlPDF';
import {InvoiceAmountDetail, InvoiceItem, InvoiceView} from 'models/invoice';
import {formatCostText} from 'utils/utils';
import {
  applyGlobalDiscountOnQuotationItems,
  applyPerItemDiscountOnQuotationItems,
  getDiscoutObj,
} from 'pages/QuotationDetails/utils';
import {calculateInvoiceAmount} from 'utils/calculate-total';
import {
  getFormattedPaymentValues,
  replacePaymentTermsPlaceholders,
} from 'utils/invoice';
import {ArticleType} from 'models/article';
import useCalculateLaborMaterialCost from 'hooks/useCalculateLaborMaterialCost';
import {stripHtmlTags} from 'pages/InvoiceDetails/utils';
import {allItemsHaveZeroDiscount} from 'utils/discount';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ClientReportForPDFConfig} from 'models/client-storage';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import PdfTemplateInvoiceDetails from './PdfTemplateInvoiceDetails';
import {ArticleSection} from './ArticleSection/ArticleSection';
import PdfPageContainer from './containers/PdfPageContainer';
import TopSectionContainer from './containers/TopSectionContainer';
import PdfBodyContainer from './containers/PdfBodyContainer';
import PdfPageTitleHtml from './containers/PdfPageTitleHtml';
import SwissPageTemplate from './SwissPageTemplate';
import AlternativeAddressTemplate from './AlternativeAddressTemplate';

Font.register({
  family: 'Montserrat-Bold',
  format: 'truetype',
  src: MontserratBold,
});

Font.register({
  family: 'Montserrat-Regular',
  format: 'truetype',
  src: MontserratRegular,
});
Font.register({
  family: 'NotoSans-Regular',
  format: 'truetype',
  src: NotoSansGeorgianRegular,
});

Font.register({
  family: 'NotoSans-Bold',
  format: 'truetype',
  src: NotoSansGeorgianBold,
});

const getStyles = (boldFontStyle?: {fontFamily: string}) =>
  StyleSheet.create({
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
      color: '#212121',
      ...boldFontStyle,
      marginTop: 15,
    },
    sectionBody: {
      fontSize: 10,
      color: '#616161',
      display: 'flex',
      flexDirection: 'column',
      paddingVertical: 1.5,
    },
    descriptionText: {
      width: '45%',
      display: 'flex',
      fontSize: 8.5,
      color: '#212121',
      paddingLeft: 20,
      letterSpacing: -0.15,
      marginTop: 2,
      lineHeight: 1.5,
    },
    signatureBox: {
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #E4E9F2',
      borderRadius: '8px',
      marginTop: 5,
      maxWidth: 270,
      height: 50,
      textAlign: 'center',
      justifyContent: 'space-around',
      position: 'relative',
    },
    signatureText: {
      position: 'absolute',
      bottom: -5,
      left: '16%',
      backgroundColor: 'white',
      padding: 1,
      ...boldFontStyle,
    },
  });

type Props = {
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
  showCurrentDateAsInvoiceDate?: boolean;
  pdfConfigClientStorage: ClientReportForPDFConfig;
};

const CreditNotePdfTemplate = ({
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
  showCurrentDateAsInvoiceDate,
  pdfConfigClientStorage,
}: Props) => {
  const articleItems = invoice?.items.map((item) => ({
    ...item,
    discount: getDiscoutObj(item?.additionalInfo?.discount),
  }))!;

  const netTotal = (articleItem: InvoiceItem) => {
    const grossTotal =
      (articleItem.unitAmount?.netAmount ?? 0) * articleItem.quantity;
    const discountValue =
      articleItem?.additionalInfo?.discount?.amount?.value ?? 0;

    return centsToMoney(currentCurrency?.code!, grossTotal - discountValue);
  };

  const discount = getDiscoutObj(invoice?.additionalInfo?.discount);
  const discountAmount = discount?.amount;
  const discountValue = discountAmount?.value ?? 0;

  const itemsAfterPerItemDiscount =
    applyPerItemDiscountOnQuotationItems(articleItems);

  const itemsAfterGlobalDiscount = applyGlobalDiscountOnQuotationItems(
    itemsAfterPerItemDiscount,
    discount,
  );

  const {amountAfterGlobalDiscount, vats, amountAfterGlobalDiscountWithVAT} =
    useMemo(
      () =>
        calculateInvoiceAmount({
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

  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const styles = getStyles(boldFontStyle);

  const customerVATId =
    (pdfConfigClientStorage.includeCustomerVAT &&
      invoice?.propertyOwner?.additionalInfo?.vatId) ||
    '';

  const eanValue = invoice?.propertyOwner.additionalInfo.ean || '';

  return (
    <Document>
      {invoice?.additionalInfo.alternativeAddress &&
        Object.keys(invoice?.additionalInfo.alternativeAddress!).length !==
          0 && (
          <AlternativeAddressTemplate
            userInfo={userInfo}
            selectedLng={selectedLng}
            translate={translate}
            headerInfo={headerInfo}
            headerPath={headerPath}
            footerInfo={footerInfo}
            footerPath={footerPath}
            alternativeServiceCompanyInfo={
              invoice?.additionalInfo.alternativeServiceCompanyInfo
            }
            alternativeAddress={invoice?.additionalInfo.alternativeAddress}
          />
        )}

      <PdfPageContainer selectedLng={selectedLng}>
        <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

        <PdfBodyContainer>
          <TopSectionContainer>
            <PdfTemplateLeftAddress
              serviceCompanyInfo={serviceCompanyInfo}
              receiverName={
                invoice?.additionalInfo?.billingAddress?.component?.name ||
                invoice?.propertyOwner?.name
              }
              addressComponent={
                invoice?.additionalInfo?.billingAddress?.component
              }
              beneficiaryInfo={
                invoice?.additionalInfo.beneficiaryAddress?.component
              }
              selectedLng={selectedLng}
              translate={translate}
              customerVATId={customerVATId}
              eanValue={eanValue}
            />

            <PdfTemplateInvoiceDetails
              userInfo={userInfo}
              pdfConfigClientStorage={pdfConfigClientStorage}
              translate={translate}
              invoice={invoice}
              selectedLng={selectedLng}
              nextCompanyExternalId={nextCompanyExternalId}
              showCurrentDateAsInvoiceDate={showCurrentDateAsInvoiceDate}
            />
          </TopSectionContainer>

          <View>
            <PdfPageTitleHtml
              value={invoice?.subject}
              selectedLng={selectedLng}
            />

            {invoice?.description.trim() !== '' && (
              <HtmlPDF
                html={invoice?.description || ''}
                rootStyle={styles.contentBody}
              />
            )}

            {invoice?.items && (
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
              />
            )}

            {invoice?.additionalInfo?.paymentTerm?.term?.trim() && (
              <View style={styles.paymentTermsSection} wrap={false}>
                <Text style={styles.sectionHeading}>
                  {translate('Payment terms')}
                </Text>
                <HtmlPDF html={replacedPaymentTerms} />
              </View>
            )}

            {invoice?.additionalInfo?.moreInfo &&
              stripHtmlTags(invoice?.additionalInfo?.moreInfo) && (
                <View wrap={false} style={styles.notesSection}>
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
                  />
                </View>
              )}
          </View>
        </PdfBodyContainer>

        <PdfTemplateFooter
          userInfo={userInfo}
          selectedLng={selectedLng}
          translate={translate}
          footerInfo={footerInfo}
          footerPath={footerPath}
        />
      </PdfPageContainer>

      {userInfo?.serviceCompany.settings.invoiceQRCodeEnabled && (
        <SwissPageTemplate qrImageSrc={qrImageSrc} />
      )}
    </Document>
  );
};

export default CreditNotePdfTemplate;
