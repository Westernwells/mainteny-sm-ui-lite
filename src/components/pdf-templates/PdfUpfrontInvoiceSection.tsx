import {Text, View, StyleSheet, Font} from '@react-pdf/renderer';
import {
  InvoiceView,
  InvoiceItem,
  DiscountType,
  PaymentType,
} from 'models/invoice';
import {
  applyDiscount,
  getAggregatedPartialPaymentsVats,
} from 'pages/InvoiceDetails/utils';
import {
  calculateTotalWithPerItemDiscount,
  calculateTotalAmountInclVats,
} from 'utils/calculate-total';
import {
  centsToMoney,
  aggregatedAmountToMoney,
  formatCurrency,
} from 'utils/currency';
import {fixRounding} from 'utils/utils';
import {Currency} from 'models/misc';
import {
  getFormattedPaymentValues,
  replacePaymentTermsPlaceholders,
} from 'utils/invoice';
import PdfInvoicedSection from './PdfInvoicedSection';
import PdfPaymentHistorySection from './PdfPaymentHistorySection';
import PdfPerItemSection from './PdfPerItemSection';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';

type PartialProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  invoice?: InvoiceView;
  selectedLng?: string;
  previousInvoices: InvoiceView[];
  articleItems: InvoiceItem[];
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

const getStyles = (boldFontStyle?: {fontFamily: string}) =>
  StyleSheet.create({
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
  });

const PdfUpfrontInvoiceSection = ({
  translate,
  currentCurrency,
  invoice,
  selectedLng,
  previousInvoices,
  articleItems,
}: PartialProps) => {
  const subtotalExclVatAfterPerItemDiscount = calculateTotalWithPerItemDiscount(
    articleItems!,
  );

  const subtotalExclVat = applyDiscount({
    actualValue: subtotalExclVatAfterPerItemDiscount,
    ...(invoice?.additionalInfo.discount?.type === DiscountType.AMOUNT
      ? {amount: invoice?.additionalInfo.discount?.amount?.value ?? 0}
      : {percentage: invoice?.additionalInfo.discount?.percentage ?? 0}),
  });

  const previousInvoicesTotalExclVat = previousInvoices
    ?.map(
      (i) =>
        (i.totalAmount?.netAmount ?? 0) /
        10 ** (i.totalAmount?.fractionDigits ?? 2),
    )
    .reduce((a, b) => a + b, 0);

  const amount =
    invoice?.additionalInfo.payment?.type === PaymentType.LUMP_SUM
      ? centsToMoney(
          currentCurrency?.code!,
          aggregatedAmountToMoney(invoice.additionalInfo.payment?.amount).value,
        ) ?? 0
      : invoice?.additionalInfo.payment?.type === PaymentType.PERCENTAGE
      ? (subtotalExclVat * (invoice?.additionalInfo.payment?.percentage ?? 0)) /
        100
      : 0;

  const totalAmountExclVat =
    amount +
    previousInvoicesTotalExclVat -
    (invoice?.totalAmount?.netAmount ?? 0) /
      10 ** (invoice?.totalAmount?.fractionDigits ?? 2);

  const totalAmountExclVatFormatted = formatCurrency(
    fixRounding(totalAmountExclVat, 2),
    {
      currency: currentCurrency?.code,
      excludeCurrencySymbol: true,
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      roundingMode: 'floor',
    },
  );

  const allItemsHasSameVAT = articleItems?.every(
    (item) =>
      item.unitAmount.percentageVat ===
      articleItems[0].unitAmount.percentageVat,
  );

  const percentageVats = articleItems?.length
    ? allItemsHasSameVAT
      ? [
          {
            percentageVat: articleItems[0].unitAmount.percentageVat,
            vat:
              totalAmountExclVat *
              (articleItems[0].unitAmount.percentageVat / 100),
          },
        ]
      : getAggregatedPartialPaymentsVats(articleItems, totalAmountExclVat)
    : [];

  const currentInvoiceAmountPercentageVats = articleItems!.length
    ? allItemsHasSameVAT
      ? [
          {
            percentageVat: articleItems![0].unitAmount.percentageVat,
            vat:
              amount * ((articleItems![0].unitAmount.percentageVat ?? 0) / 100),
          },
        ]
      : getAggregatedPartialPaymentsVats(articleItems!, amount)
    : [];

  const totalAmountInclVats = calculateTotalAmountInclVats({
    subtotalExclVatAfterDiscount: totalAmountExclVat,
    percentageVats,
  });

  const totalAmountInclVatsFormatted = formatCurrency(
    fixRounding(totalAmountInclVats, 2),
    {
      currency: currentCurrency?.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      roundingMode: 'floor',
      excludeCurrencySymbol: true,
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
    },
  );

  const hasPreviousInvoices = previousInvoices.length > 0;

  const paidAmountInclVats = previousInvoices
    .map((i) =>
      i.payments.reduce(
        (acc, p) =>
          acc + (p.amount?.value ?? 0) / 10 ** (p.amount?.fractionDigits ?? 2),
        0,
      ),
    )
    .reduce((acc, a) => acc + a, 0);
  const outstandingPayments = totalAmountInclVats - paidAmountInclVats;

  const outstandingAmountFormatted = formatCurrency(outstandingPayments, {
    currency: currentCurrency?.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    roundingMode: 'floor',
    excludeCurrencySymbol: true,
    currencySymbol: currentCurrency?.symbol,
    companyLang: selectedLng,
  });

  const hasPayments = previousInvoices.map((i) => i.payments).flat().length > 0;

  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const styles = getStyles(boldFontStyle);

  const invoiceAmount =
    amount +
    currentInvoiceAmountPercentageVats
      .map((v) => v.vat)
      .reduce((a, b) => a + b, 0);

  const formattedPaymentValues = getFormattedPaymentValues(
    invoice?.additionalInfo.paymentTerm!,
    invoice!,
    invoiceAmount,
  );

  return (
    <View wrap={false}>
      {invoice?.additionalInfo.payment?.type === PaymentType.PER_ITEM && (
        <PdfPerItemSection
          translate={translate}
          selectedLng={selectedLng}
          currentCurrency={currentCurrency}
          previousInvoices={previousInvoices}
          invoice={invoice}
        />
      )}

      {invoice?.additionalInfo.payment?.type !== PaymentType.PER_ITEM && (
        <View>
          <View
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
              width: '100%',
              marginTop: 20,
            }}>
            <Text
              style={{
                ...styles.tableHeading,
                textAlign: 'left',
                width: '60%',
              }}>
              {translate('Partial Invoices')}
            </Text>

            {invoice?.additionalInfo.payment?.type ===
              PaymentType.PERCENTAGE && (
              <Text
                style={{
                  ...styles.tableHeading,
                  textAlign: 'right',
                  width: '15%',
                }}>
                {translate('Percentage')}
              </Text>
            )}

            <Text
              style={{
                ...styles.tableHeading,
                textAlign: 'right',
                width:
                  invoice?.additionalInfo.payment?.type ===
                  PaymentType.PERCENTAGE
                    ? '25%'
                    : '40%',
              }}>
              {translate('Total')}
              {` (${currentCurrency?.symbol})`}
            </Text>
          </View>

          {previousInvoices.map((previousInvoice, index) => (
            <View
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                flexDirection: 'row',
                marginVertical: 4,
                borderBottomWidth:
                  index === previousInvoices.length - 1 ? 1 : 0,
                borderBottomColor: '#212121',
              }}
              wrap={false}
              key={previousInvoice.id}>
              <Text
                style={{
                  textAlign: 'left',
                  color: '#212121',
                  width: '60%',
                }}>
                {previousInvoice.additionalInfo.payment?.description}
              </Text>
              {invoice?.additionalInfo.payment?.type ===
                PaymentType.PERCENTAGE && (
                <Text
                  style={{
                    textAlign: 'right',
                    color: '#212121',
                    width: '15%',
                  }}>
                  {previousInvoice.additionalInfo.payment?.percentage}%
                </Text>
              )}

              <Text
                style={{
                  textAlign: 'right',
                  color: '#212121',
                  width:
                    previousInvoice.additionalInfo.payment?.type ===
                    PaymentType.PERCENTAGE
                      ? '25%'
                      : '40%',
                }}>
                {formatCurrency(
                  centsToMoney(
                    currentCurrency?.code!,
                    aggregatedAmountToMoney(
                      previousInvoice?.additionalInfo.payment?.amount,
                    ).value ?? 0,
                  ),
                  {
                    currency: currentCurrency?.code,
                    excludeCurrencySymbol: true,
                    currencySymbol: currentCurrency?.symbol,
                    companyLang: selectedLng,
                  },
                )}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.tableRow}>
        <Text style={{width: '44%'}} />
        <Text
          style={{
            width: '32%',
            color: '#616161',
            fontSize: 10,
            textAlign: 'right',
          }}>
          {translate('Subtotal excl. VAT')}
        </Text>
        <Text
          style={{
            width: '24%',
            textAlign: 'right',
            fontSize: 10,
          }}>
          {totalAmountExclVatFormatted}
        </Text>
      </View>

      <View>
        {allItemsHasSameVAT ? (
          <View style={styles.tableRow}>
            <Text style={{width: '44%'}} />
            <Text
              style={{
                width: '32%',
                color: '#616161',
                fontSize: 10,
                textAlign: 'right',
              }}>
              {translate('VAT')} {percentageVats[0].percentageVat ?? 0}%
            </Text>
            <Text
              style={{
                width: '24%',
                textAlign: 'right',
                fontSize: 10,
              }}>
              {formatCurrency(fixRounding(percentageVats?.[0]?.vat ?? 0, 2), {
                currency: currentCurrency?.code,
                excludeCurrencySymbol: true,
                currencySymbol: currentCurrency?.symbol,
                companyLang: selectedLng,
              })}
            </Text>
          </View>
        ) : (
          percentageVats.map((v, index) => (
            <View style={styles.tableRow} key={`${index}-${v.percentageVat}`}>
              <Text style={{width: '44%'}} />
              <Text
                style={{
                  width: '32%',
                  color: '#616161',
                  fontSize: 10,
                  textAlign: 'right',
                }}>
                {translate('VAT')} {v.percentageVat}%
              </Text>
              <Text
                style={{
                  width: '24%',
                  textAlign: 'right',
                  fontSize: 10,
                }}>
                {formatCurrency(fixRounding(v.vat, 2), {
                  currency: currentCurrency?.code,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  roundingMode: 'floor',
                  excludeCurrencySymbol: true,
                  companyLang: selectedLng,
                  currencySymbol: currentCurrency?.symbol,
                })}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.tableRow}>
        <Text style={{width: '44%'}} />
        <Text
          style={{
            width: '32%',
            color: '#212121',
            ...boldFontStyle,
            textAlign: 'right',
            fontSize: 10,
            paddingLeft: 25,
          }}>
          {`${translate('Total incl. VAT')} (${currentCurrency?.symbol})`}
        </Text>
        <Text
          style={{
            width: '24%',
            textAlign: 'right',
            color: '#212121',
            ...boldFontStyle,
            fontSize: 10,
          }}>
          {totalAmountInclVatsFormatted}
        </Text>
      </View>

      {hasPreviousInvoices && previousInvoices.length > 1 && (
        <PdfInvoicedSection
          translate={translate}
          currentCurrency={currentCurrency}
          previousInvoices={previousInvoices}
          amount={amount}
          currentInvoiceAmountPercentageVats={
            currentInvoiceAmountPercentageVats
          }
        />
      )}

      {hasPayments && (
        <PdfPaymentHistorySection
          translate={translate}
          currentCurrency={currentCurrency}
          previousInvoices={previousInvoices}
          totalAmountInclVatsFormatted={totalAmountInclVatsFormatted}
          outstandingAmountFormatted={outstandingAmountFormatted}
          selectedLng={selectedLng}
        />
      )}

      {invoice?.additionalInfo?.paymentTerm?.term?.trim() && (
        <View style={styles.notesSection} wrap={false}>
          <Text style={styles.sectionHeading}>
            {translate('Payment terms')}
          </Text>
          <Text>
            {replacePaymentTermsPlaceholders(
              invoice?.additionalInfo.paymentTerm?.term!,
              formattedPaymentValues ?? [],
            )}
          </Text>
        </View>
      )}
    </View>
  );
};

export default PdfUpfrontInvoiceSection;
