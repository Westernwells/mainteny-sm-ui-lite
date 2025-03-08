import {useMemo} from 'react';
import {Document, View, StyleSheet, Font} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import {centsToMoney, formatCurrency, moneyToCents} from 'utils/currency';
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
  correctCreditNoteInvoicesPercentages,
  stripHtmlTags,
} from 'pages/InvoiceDetails/utils';
import useCalculateLaborMaterialCost from 'hooks/useCalculateLaborMaterialCost';
import {allItemsHaveZeroDiscount} from 'utils/discount';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {getAddressComponentFromInvoice} from 'utils/pdfTemplates';
import MontserratRegular from '../../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import PdfTemplateInvoiceDetails from '../PdfTemplateInvoiceDetails';
import {ArticleSection} from '../ArticleSection/ArticleSection';
import PdfBodyContainer from '../containers/PdfBodyContainer';
import PdfPageContainer from '../containers/PdfPageContainer';
import TopSectionContainer from '../containers/TopSectionContainer';
import PdfPageTitleHtml from '../containers/PdfPageTitleHtml';
import SwissPageTemplate from '../SwissPageTemplate';
import AlternativeAddressTemplate from '../AlternativeAddressTemplate';
import PdfPreviewUpfrontPaymentSection from './PdfPreviewUpfrontPaymentSection';
import PdfPreviewPartialPaymentSection from './PdfPreviewPartialPaymentSection';

type Props = {
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
};

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

const getStyles = (
  boldFontStyle?: {fontFamily: string},
  regularFontStyle?: {fontFamily: string},
) =>
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
      color: '#212121',
      flex: '0 0 43%',
    },
    tagContent: {
      fontSize: 9,
      color: '#616161',
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
      color: '#616161',
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

  const articleItems = invoice?.items.map((item, index) => ({
    ...item,
    additionalInfo: {
      discount: getDiscoutObj(invoiceAmountDetail?.items[index]?.discount),
      payment: {
        ...invoiceAmountDetail?.items[index]?.payment,
        type: invoiceAmountDetail?.items[index]?.payment.type!,
        amount: {
          ...invoiceAmountDetail?.items[index]?.payment.amount,
          netAmount: moneyToCents(
            currentCurrency?.code!,
            invoiceAmountDetail?.items[index]?.payment.amount?.netAmount,
          ),
          currency:
            invoiceAmountDetail?.items[index]?.payment.amount?.currency ||
            currentCurrency?.code!,
          vats: invoiceAmountDetail?.items[index]?.payment.amount?.vats || [],
        },
      },
    },
    discount: getDiscoutObj(invoiceAmountDetail?.items[index]?.discount),
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

  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const regularFontStyle = {
    fontFamily:
      selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
  };

  const styles = getStyles(boldFontStyle, regularFontStyle);

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
              fallbackReceiverName={invoice?.propertyOwner?.name}
              addressComponent={getAddressComponentFromInvoice(invoice)}
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
            />
          </TopSectionContainer>

          <View>
            <PdfPageTitleHtml
              selectedLng={selectedLng}
              value={invoice?.subject}
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
                />
              )}

            {isPartialInvoice && (
              <PdfPreviewPartialPaymentSection
                translate={translate}
                selectedLng={selectedLng}
                invoice={invoice}
                invoiceAmountDetail={invoiceAmountDetail}
                currentCurrency={currentCurrency}
                previousInvoices={finalPreviousInvoices!}
                articleItems={articleItems}
              />
            )}

            {isUpfrontInvoice && (
              <PdfPreviewUpfrontPaymentSection
                translate={translate}
                selectedLng={selectedLng}
                invoice={invoice}
                currentCurrency={currentCurrency}
                previousInvoices={finalPreviousInvoices!}
                articleItems={articleItems}
                invoiceAmountDetail={invoiceAmountDetail}
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

export default PdfPartialUpfrontPreview;
