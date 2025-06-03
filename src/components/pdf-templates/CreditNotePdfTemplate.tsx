import {Document, StyleSheet, Text, View} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import {useMemo} from 'react';
import {centsToMoney} from 'utils/currency';
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
import {
  getFormattedPaymentValues,
  hasAlternativeAddress,
  replacePaymentTermsPlaceholders,
} from 'utils/invoice';
import useCalculateLaborMaterialCost from 'hooks/useCalculateLaborMaterialCost';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {getAddressComponentFromInvoice} from 'utils/pdfTemplates';
import {ContextProps} from 'context/PdfStylesProvider';
import {ServiceCompanyItem} from 'models/service-company';
import {PdfConfigurationStyles} from 'models/pdfs';
import PdfTemplateInvoiceDetails from './PdfTemplateInvoiceDetails';
import {ArticleSection} from './ArticleSection/ArticleSection';
import PdfPageContainer from './containers/PdfPageContainer';
import TopSectionContainer from './containers/TopSectionContainer';
import PdfBodyContainer from './containers/PdfBodyContainer';
import PdfPageTitleHtml from './containers/PdfPageTitleHtml';
import AlternativeAddressTemplate from './AlternativeAddressTemplate';
import SwissPageTemplate from './SwissPageTemplate';
import {InvoiceNotesPdf} from './components/InvoiceNotesPdf';

const getStyles = ({boldFontStyle, primaryColor}: PdfConfigurationStyles) =>
  StyleSheet.create({
    dataBody: {
      borderBottom: '1px solid #212121',
    },
    contentBody: {
      marginTop: 6,
      marginBottom: 16,
      color: primaryColor,
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

const CreditNotePdfTemplate = ({
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

  const {labor, material} = useCalculateLaborMaterialCost(
    invoiceItems,
    invoiceAmountDetail,
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
      {hasAlternativeAddress(invoice?.additionalInfo?.alternativeAddress) && (
        <AlternativeAddressTemplate
          serviceCompany={serviceCompany}
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
              serviceCompany={serviceCompany}
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
                fontStyles={fontStyles}
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

            {invoice?.additionalInfo?.paymentTerm?.term?.trim() && (
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
                  fontStyles={fontStyles}
                />
              </View>
            )}

            <InvoiceNotesPdf
              moreInfo={invoice?.additionalInfo?.moreInfo}
              labor={labor}
              material={material}
              currentCurrency={currentCurrency}
              selectedLng={selectedLng}
              fontStyles={fontStyles}
            />
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

export default CreditNotePdfTemplate;
