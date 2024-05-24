import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import {formatCurrency} from 'utils/currency';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {
  DiscountType,
  InvoiceItem,
  InvoiceType,
  InvoiceView,
} from 'models/invoice';
import {formatCostText} from 'utils/utils';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
import {
  calculateSameVatTotals,
  calculateTotalWithPerItemDiscount,
} from 'utils/calculate-total';
import {ArticleType} from 'models/article';
import {
  applyDiscount,
  applyGlobalDiscountOnItems,
  applyPerItemDiscountOnItems,
  getAggregatedItemsVats,
} from 'pages/InvoiceDetails/utils';
import useCalculateLaborMaterialCost from 'hooks/useCalculateLaborMaterialCost';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import PdfTemplateInvoiceDetails from './PdfTemplateInvoiceDetails';
import {ArticleSection} from './FinalInvoicePdfTemplate';
import PdfPartialPaymentSection from './PdfPartialPaymentSection';
import PdfUpfrontInvoiceSection from './PdfUpfrontInvoiceSection';

type Props = {
  translate: (key: string) => string;
  userInfo?: UserAccount | undefined;
  logoSrc?: string;
  currentCurrency?: Currency;
  logoDimensions?: {
    width: number;
    height: number;
  } | null;
  invoice?: InvoiceView;
  selectedLng?: string;
  previousInvoices: InvoiceView[];
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
      color: '#212121',
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
    contentHeader: {
      fontSize: 14,
      color: '#212121',
      ...boldFontStyle,
      marginBottom: 10,
    },
    contentBody: {
      color: '#212121',
      fontSize: 10,
      marginVertical: 15,
      lineHeight: 1.3,
      maxWidth: '100%',
    },
    notesSection: {
      marginTop: 5,
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

const PartialInvoicePdfTemplate = ({
  translate,
  userInfo,
  logoSrc,
  currentCurrency,
  logoDimensions,
  invoice,
  selectedLng,
  previousInvoices,
}: Props) => {
  const hasPreviousInvoices = previousInvoices.length > 0;
  const firstInvoiceType = previousInvoices?.[0]?.type ?? null;
  const isFinalInvoice = invoice?.type === InvoiceType.FINAL;
  const isCreditNoteInvoice = invoice?.type === InvoiceType.CREDIT_NOTE;
  const havePartialInvoices = previousInvoices.some(
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

  const netTotal = (articleItem: InvoiceItem) => {
    const grossTotal =
      (articleItem.unitAmount?.netAmount ?? 0) * articleItem.quantity;
    const discountValue =
      articleItem?.additionalInfo?.discount?.amount?.value ?? 0;

    return (
      (grossTotal - discountValue) /
        10 ** articleItem.unitAmount.fractionDigits ?? 2
    );
  };

  const discount = getDiscoutObj(invoice?.additionalInfo?.discount);
  const discountType = discount?.type;
  const discountAmount = discount?.amount;
  const discountPercentage = discount?.percentage;
  const discountValue = discountAmount?.value ?? 0;

  const subtotalExclVat = calculateTotalWithPerItemDiscount(articleItems);

  const subtotalExclVatFormatted = formatCurrency(
    subtotalExclVat - discountValue,
    {
      currency: currentCurrency?.code,
      excludeCurrencySymbol: true,
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
    },
  );

  const subtotalExclVatAfterDiscount = applyDiscount({
    actualValue: subtotalExclVat,
    ...(discountType === DiscountType.AMOUNT
      ? {amount: discountValue ?? 0}
      : {percentage: discountPercentage ?? 0}),
  });

  const itemsAfterPerItemDiscount = applyPerItemDiscountOnItems(articleItems);

  const itemsAfterGlobalDiscount = applyGlobalDiscountOnItems(
    itemsAfterPerItemDiscount,
    discount,
  );

  const allItemsHasSameVAT = itemsAfterGlobalDiscount.every(
    (item) =>
      item.unitAmount.percentageVat ===
      articleItems[0].unitAmount.percentageVat,
  );

  const percentageVats = itemsAfterGlobalDiscount.length
    ? allItemsHasSameVAT
      ? [
          {
            percentageVat: itemsAfterGlobalDiscount[0].unitAmount.percentageVat,
            vat:
              subtotalExclVatAfterDiscount *
              (itemsAfterGlobalDiscount[0].unitAmount.percentageVat / 100),
          },
        ]
      : getAggregatedItemsVats(itemsAfterGlobalDiscount)
    : [];

  const {total, totalVAT} = calculateSameVatTotals(itemsAfterGlobalDiscount);

  const allItemsHaveZeroDiscount = articleItems.every(
    (item) =>
      item?.additionalInfo?.discount?.amount?.value === 0 ||
      item?.additionalInfo?.discount?.percentage === 0,
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

  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const regularFontStyle = {
    fontFamily:
      selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
  };

  const styles = getStyles(boldFontStyle, regularFontStyle);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <PdfTemplateHeader
            logoSrc={logoSrc}
            logoDimensions={logoDimensions}
          />

          <View style={styles.topSection}>
            <PdfTemplateLeftAddress
              companyName={userInfo?.serviceCompany?.name}
              billingAddressName={
                userInfo?.serviceCompany?.billingAddress?.fullName
              }
              receiverName={invoice?.propertyOwner?.name}
              addressComponent={
                invoice?.additionalInfo?.billingAddress?.component
              }
              beneficiaryInfo={
                invoice?.additionalInfo.beneficiaryAddress?.component
              }
              selectedLng={selectedLng}
              translate={translate}
            />

            <PdfTemplateInvoiceDetails
              translate={translate}
              invoice={invoice}
              selectedLng={selectedLng}
            />
          </View>

          <View>
            <Text style={styles.contentHeader}>{invoice?.subject}</Text>

            {invoice?.description.trim() !== '' && (
              <Text style={styles.contentBody}>{invoice?.description}</Text>
            )}

            {invoice?.additionalInfo.showArticleSection && (
              <ArticleSection
                invoice={invoice}
                currentCurrency={currentCurrency}
                translate={translate}
                allItemsHaveZeroDiscount={allItemsHaveZeroDiscount}
                discountValue={discountValue}
                subtotalExclVatFormatted={subtotalExclVatFormatted}
                allItemsHasSameVAT={allItemsHasSameVAT}
                percentageVats={percentageVats}
                totalVAT={totalVAT}
                total={total}
                selectedLng={selectedLng}
                netTotal={netTotal}
              />
            )}

            {isPartialInvoice && (
              <PdfPartialPaymentSection
                translate={translate}
                selectedLng={selectedLng}
                invoice={invoice}
                currentCurrency={currentCurrency}
                previousInvoices={previousInvoices}
                articleItems={articleItems}
              />
            )}

            {isUpfrontInvoice && (
              <PdfUpfrontInvoiceSection
                translate={translate}
                selectedLng={selectedLng}
                invoice={invoice}
                currentCurrency={currentCurrency}
                previousInvoices={previousInvoices}
                articleItems={articleItems}
              />
            )}

            {invoice?.additionalInfo?.moreInfo?.trim() && (
              <View wrap={false}>
                <Text style={styles.sectionHeading}>{translate('Notes')}</Text>
                <Text>
                  {formatCostText(
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
                </Text>
              </View>
            )}
          </View>
        </View>

        <PdfTemplateFooter
          userInfo={userInfo}
          selectedLng={selectedLng}
          translate={translate}
        />
      </Page>
    </Document>
  );
};

export default PartialInvoicePdfTemplate;
