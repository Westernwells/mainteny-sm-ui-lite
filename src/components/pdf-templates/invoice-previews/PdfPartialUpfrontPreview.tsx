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
  InvoiceType,
  InvoiceView,
} from 'models/invoice';
import {correctCreditNoteInvoicesPercentages} from 'pages/InvoiceDetails/utils';
import useCalculateLaborMaterialCost from 'hooks/useCalculateLaborMaterialCost';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {getAddressComponentFromInvoice} from 'utils/pdfTemplates';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import {ServiceCompanyItem} from 'models/service-company';
import {hasAlternativeAddress} from 'utils/invoice';
import PdfTemplateInvoiceDetails from '../PdfTemplateInvoiceDetails';
import {ArticleSection} from '../ArticleSection/ArticleSection';
import PdfBodyContainer from '../containers/PdfBodyContainer';
import PdfPageContainer from '../containers/PdfPageContainer';
import TopSectionContainer from '../containers/TopSectionContainer';
import PdfPageTitleHtml from '../containers/PdfPageTitleHtml';
import SwissPageTemplate from '../SwissPageTemplate';
import AlternativeAddressTemplate from '../AlternativeAddressTemplate';
import {InvoiceNotesPdf} from '../components/InvoiceNotesPdf';
import PdfPartialPaymentSection from '../PdfPartialPaymentSection';
import PdfUpfrontPaymentSection from './PdfUpfrontPaymentSection';

type Props = {
  serviceCompany?: ServiceCompanyItem;
  translate: (key: string) => string;
  userInfo?: UserAccount | undefined;
  currentCurrency?: Currency;
  invoice?: InvoiceView;
  invoiceAmountDetail?: InvoiceAmountDetail;
  selectedLng?: string;
  previousInvoices: InvoiceView[];
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
  nextCompanyExternalId?: string;
  qrImageSrc?: string;
  pdfConfigClientStorage: ClientReportForPDFConfig;
  invoiceItems: EditableInvoiceItem[];
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const getStyles = ({
  boldFontStyle,
  regularFontStyle,
  primaryColor,
  secondaryColor,
}: PdfConfigurationStyles) =>
  StyleSheet.create({
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
      paddingBottom: 16,
      color: primaryColor,
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
    table: {
      width: '100%',
      display: 'flex',
    },
    tableHead: {
      display: 'flex',
      flexDirection: 'row',
      paddingVertical: 4,
    },
    tableHeading: {
      color: secondaryColor,
      display: 'flex',
      fontSize: 6,
      textTransform: 'uppercase',
    },
    tableRow: {
      display: 'flex',
      flexDirection: 'row',
      fontSize: 10,
      marginVertical: 4,
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
  });

const PdfPartialUpfrontPreview = ({
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
  const isEditing = !!invoice?.id;

  const finalPreviousInvoices = correctCreditNoteInvoicesPercentages(
    isEditing
      ? previousInvoices?.slice(
          0,
          previousInvoices.findIndex((i) => i.id === invoice?.id) + 1,
        )
      : previousInvoices,
  );

  const hasPreviousInvoices = finalPreviousInvoices!.length > 0;
  const firstInvoiceType = finalPreviousInvoices?.[0]?.type ?? null;
  const isFinalInvoice = invoice?.type === InvoiceType.FINAL;
  const isCreditNoteInvoice = invoice?.type === InvoiceType.CREDIT_NOTE;
  const havePartialInvoices = finalPreviousInvoices?.some(
    (i) => i.type === InvoiceType.PARTIAL,
  );
  const isPartialInvoice =
    invoice?.type === InvoiceType.PARTIAL ||
    (hasPreviousInvoices &&
      !isCreditNoteInvoice &&
      ((firstInvoiceType === InvoiceType.PARTIAL && isFinalInvoice) ||
        (firstInvoiceType === InvoiceType.UPFRONT && havePartialInvoices)));

  const isUpfrontInvoice =
    !isPartialInvoice &&
    (invoice?.type === InvoiceType.UPFRONT ||
      (hasPreviousInvoices &&
        firstInvoiceType === InvoiceType.UPFRONT &&
        isFinalInvoice));

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
            <View minPresenceAhead={86} />
            {invoice?.additionalInfo.showArticleSection &&
              invoiceItems.length > 0 && (
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

            {isPartialInvoice && (
              <PdfPartialPaymentSection
                translate={translate}
                selectedLng={selectedLng}
                invoice={invoice}
                invoiceAmountDetail={invoiceAmountDetail}
                currentCurrency={currentCurrency}
                previousInvoices={finalPreviousInvoices!}
                fontStyles={fontStyles}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            )}

            {isUpfrontInvoice && (
              <PdfUpfrontPaymentSection
                translate={translate}
                selectedLng={selectedLng}
                invoice={invoice}
                currentCurrency={currentCurrency}
                previousInvoices={finalPreviousInvoices!}
                invoiceAmountDetail={invoiceAmountDetail}
                fontStyles={fontStyles}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
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

export default PdfPartialUpfrontPreview;
