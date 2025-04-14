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
  InvoiceType,
  InvoiceView,
} from 'models/invoice';
import {formatCostText} from 'utils/utils';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
import {
  calculateArticlesAmount,
  getItemTotalAfterPerItemDiscount,
} from 'utils/calculate-total';
import {ArticleType} from 'models/article';
import {
  applyGlobalDiscountOnItems,
  applyPerItemDiscountOnItems,
  stripHtmlTags,
} from 'pages/InvoiceDetails/utils';
import useCalculateLaborMaterialCost from 'hooks/useCalculateLaborMaterialCost';
import {allItemsHaveZeroDiscount} from 'utils/discount';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {getAddressComponentFromInvoice} from 'utils/pdfTemplates';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import {ServiceCompanyItem} from 'models/service-company';
import PdfTemplateInvoiceDetails from './PdfTemplateInvoiceDetails';
import {ArticleSection} from './ArticleSection/ArticleSection';
import PdfPartialPaymentSection from './PdfPartialPaymentSection';
import PdfUpfrontInvoiceSection from './PdfUpfrontInvoiceSection';
import PdfBodyContainer from './containers/PdfBodyContainer';
import PdfPageContainer from './containers/PdfPageContainer';
import TopSectionContainer from './containers/TopSectionContainer';
import PdfPageTitleHtml from './containers/PdfPageTitleHtml';
import SwissPageTemplate from './SwissPageTemplate';
import AlternativeAddressTemplate from './AlternativeAddressTemplate';

type Props = {
  serviceCompany?: ServiceCompanyItem;
  translate: (key: string) => string;
  userInfo?: UserAccount | undefined;
  currentCurrency?: Currency;
  invoice?: InvoiceView;
  invoiceAmountDetail?: InvoiceAmountDetail;
  selectedLng?: string;
  previousInvoices?: InvoiceView[];
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
  nextCompanyExternalId?: string;
  qrImageSrc?: string;
  pdfConfigClientStorage: ClientReportForPDFConfig;
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
      marginBottom: 16,
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
  });

const PartialInvoicePdfTemplate = ({
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
  fontStyles,
  primaryColor,
  secondaryColor,
}: Props) => {
  const hasPreviousInvoices = previousInvoices!.length > 0;
  const firstInvoiceType = previousInvoices?.[0]?.type ?? null;
  const isFinalInvoice = invoice?.type === InvoiceType.FINAL;
  const isCreditNoteInvoice = invoice?.type === InvoiceType.CREDIT_NOTE;
  const havePartialInvoices = previousInvoices?.some(
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

  const articleItems = invoice?.items.map((item) => ({
    ...item,
    discount: getDiscoutObj(item?.additionalInfo?.discount),
  }))!;

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

  const discount = getDiscoutObj(invoice?.additionalInfo?.discount);
  const discountAmount = discount?.amount;
  const discountValue = discountAmount?.value ?? 0;

  const itemsAfterPerItemDiscount = applyPerItemDiscountOnItems(articleItems);

  const itemsAfterGlobalDiscount = applyGlobalDiscountOnItems(
    itemsAfterPerItemDiscount,
    discount,
  );

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

            {isPartialInvoice && (
              <PdfPartialPaymentSection
                translate={translate}
                selectedLng={selectedLng}
                invoice={invoice}
                invoiceAmountDetail={invoiceAmountDetail}
                currentCurrency={currentCurrency}
                previousInvoices={previousInvoices!}
                articleItems={articleItems}
                fontStyles={fontStyles}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            )}

            {isUpfrontInvoice && (
              <PdfUpfrontInvoiceSection
                translate={translate}
                selectedLng={selectedLng}
                invoice={invoice}
                currentCurrency={currentCurrency}
                previousInvoices={previousInvoices!}
                articleItems={articleItems}
                invoiceAmountDetail={invoiceAmountDetail}
                fontStyles={fontStyles}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
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

export default PartialInvoicePdfTemplate;
