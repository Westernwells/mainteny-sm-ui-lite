import {Document, StyleSheet, View} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
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
import useCalculateLaborMaterialCost from 'hooks/useCalculateLaborMaterialCost';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {getAddressComponentFromInvoice} from 'utils/pdfTemplates';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import {ServiceCompanyItem} from 'models/service-company';
import {hasAlternativeAddress} from 'utils/invoice';
import PdfTemplateInvoiceDetails from './PdfTemplateInvoiceDetails';
import PdfPartialPaymentSection from './PdfPartialPaymentSection';
import PdfPageContainer from './containers/PdfPageContainer';
import PdfBodyContainer from './containers/PdfBodyContainer';
import TopSectionContainer from './containers/TopSectionContainer';
import PdfPageTitleHtml from './containers/PdfPageTitleHtml';
import {ArticleSection} from './ArticleSection/ArticleSection';
import AlternativeAddressTemplate from './AlternativeAddressTemplate';
import SwissPageTemplate from './SwissPageTemplate';
import {InvoiceNotesPdf} from './components/InvoiceNotesPdf';

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
  serviceCompany?: ServiceCompanyItem;
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
  invoiceItems: EditableInvoiceItem[];
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const FinalInvoicePdfTemplate = ({
  serviceCompany,
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
  invoiceItems,
  fontStyles,
  primaryColor,
  secondaryColor,
}: Props) => {
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
              translate={translate}
              invoice={invoice}
              nextCompanyExternalId={nextCompanyExternalId}
              pdfConfigClientStorage={pdfConfigClientStorage}
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

            {invoice?.additionalInfo.showArticleSection &&
              invoiceItems.length && (
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

            <PdfPartialPaymentSection
              translate={translate}
              selectedLng={selectedLng}
              invoice={invoice}
              invoiceAmountDetail={invoiceAmountDetail}
              currentCurrency={currentCurrency}
              previousInvoices={previousInvoices}
              fontStyles={fontStyles}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              invoiceItems={invoiceItems}
            />

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

export default FinalInvoicePdfTemplate;
