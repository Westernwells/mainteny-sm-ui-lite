import {View, Font, StyleSheet, Text} from '@react-pdf/renderer';
import {
  InvoiceView,
  InvoiceItemView,
  DiscountType,
  PaymentType,
  InvoiceAmountDetail,
  InvoiceType,
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
  getCurrencySymbol,
} from 'utils/currency';
import {fixRounding} from 'utils/utils';
import {Currency, State} from 'models/misc';
import {
  getFormattedPaymentValuesForPartialUpfrontAndFinal,
  replacePaymentTermsPlaceholders,
} from 'utils/invoice';
import {HtmlPDF} from 'components/HtmlPDF';
import {useMemo} from 'react';
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
  invoiceAmountDetail?: InvoiceAmountDetail;
  selectedLng?: string;
  previousInvoices: InvoiceView[];
  articleItems: InvoiceItemView[];
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
    table: {
      width: '100%',
      display: 'flex',
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

export const PdfPartialPaymentSection = ({
  translate,
  currentCurrency,
  invoice,
  invoiceAmountDetail,
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
      ? {
          amount:
            centsToMoney(
              currentCurrency?.code!,
              invoice?.additionalInfo.discount?.amount?.value ?? 0,
            ) ?? 0,
        }
      : {percentage: invoice?.additionalInfo.discount?.percentage ?? 0}),
  });

  const previousInvoicesTotalExclVat = centsToMoney(
    currentCurrency?.code!,
    previousInvoices
      ?.map((i) => i.totalAmount?.netAmount || 0)
      .reduce((a, b) => a + b, 0),
  );

  const amount =
    invoice?.additionalInfo.payment?.type === PaymentType.LUMP_SUM
      ? centsToMoney(
          currentCurrency?.code!,
          aggregatedAmountToMoney(invoice.additionalInfo.payment?.amount).value,
        ) ?? 0
      : invoice?.additionalInfo.payment?.type === PaymentType.PERCENTAGE
      ? (subtotalExclVat * (invoice?.additionalInfo.payment?.percentage ?? 0)) /
        100
      : invoice?.additionalInfo.payment?.type === PaymentType.PER_ITEM
      ? articleItems!
          .map((item) => {
            // Calculate base amount from unit price and quantity
            const baseAmount = (item.unitAmount.netAmount ?? 0) * item.quantity;

            // Get discount from additionalInfo
            const discount = item.additionalInfo?.discount;
            const discountParams =
              discount?.type === DiscountType.AMOUNT
                ? {amount: discount?.amount?.value ?? 0}
                : {percentage: discount?.percentage ?? 0};

            // Calculate discounted price based on discount type
            const itemTotalPriceExclVat = applyDiscount({
              actualValue: baseAmount,
              ...discountParams,
            });

            // Calculate and convert final amount based on payment percentage
            const paymentPercentage =
              item.additionalInfo?.payment?.percentage ?? 0;
            return centsToMoney(
              item.unitAmount.currency,
              (itemTotalPriceExclVat / 100) * paymentPercentage,
            );
          })
          .reduce((a, b) => a + b, 0)
      : 0;

  const totalAmountExclVat =
    amount +
    previousInvoicesTotalExclVat -
    centsToMoney(currentCurrency?.code!, invoice?.totalAmount?.netAmount);

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
            percentageVat: articleItems[0].unitAmount.percentageVat ?? 0,
            vat:
              totalAmountExclVat *
              ((articleItems[0].unitAmount.percentageVat ?? 0) / 100),
          },
        ]
      : getAggregatedPartialPaymentsVats(articleItems, totalAmountExclVat)
    : [];

  const currentInvoiceAmountPercentageVats = articleItems!.length
    ? allItemsHasSameVAT
      ? [
          {
            percentageVat: articleItems![0].unitAmount.percentageVat ?? 0,
            vat:
              amount *
              centsToMoney(
                currentCurrency?.code!,
                articleItems![0].unitAmount.percentageVat ?? 0,
              ),
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
      i.payments
        ?.filter((payment) => payment.meta.state === State.ACTIVE)
        .reduce(
          (acc, p) =>
            acc +
            (p.amount?.value ?? 0) / 10 ** (p.amount?.fractionDigits ?? 2),
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

  const hasPayments =
    previousInvoices
      .map((i) =>
        i.payments?.filter((payment) => payment.meta.state === State.ACTIVE),
      )
      .flat().length > 0;

  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const styles = getStyles(boldFontStyle);

  const formattedPaymentValues = useMemo(() => {
    if (
      invoice?.additionalInfo.paymentTerm?.term &&
      invoice &&
      invoiceAmountDetail
    ) {
      return getFormattedPaymentValuesForPartialUpfrontAndFinal(
        invoice.additionalInfo.paymentTerm,
        invoice,
        invoice.totalAmount.grossAmount || 0,
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

  return (
    <View>
      {invoice?.additionalInfo.payment?.type === PaymentType.PER_ITEM &&
        previousInvoices.length && (
          <PdfPerItemSection
            translate={translate}
            selectedLng={selectedLng}
            currentCurrency={currentCurrency}
            invoice={invoice}
            previousInvoices={previousInvoices}
          />
        )}

      {invoice?.additionalInfo.payment?.type !== PaymentType.PER_ITEM &&
        previousInvoices.length && (
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
                {` (${getCurrencySymbol[currentCurrency?.code!]})`}
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
                key={previousInvoice.id}>
                <Text
                  style={{
                    textAlign: 'left',
                    color: '#212121',
                    width: '60%',
                  }}>
                  {previousInvoice.type === InvoiceType.CREDIT_NOTE
                    ? translate('Credit Note invoice')
                    : previousInvoice.additionalInfo.payment?.description}
                </Text>
                {invoice?.additionalInfo.payment?.type ===
                  PaymentType.PERCENTAGE && (
                  <Text
                    style={{
                      textAlign: 'right',
                      color: '#212121',
                      width: '15%',
                    }}>
                    {fixRounding(
                      previousInvoice.additionalInfo.payment?.percentage ?? 0,
                      2,
                    )}
                    %
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

      {previousInvoices.length && (
        <View>
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
                  {translate('VAT')} {percentageVats[0]?.percentageVat ?? 0}%
                </Text>
                <Text
                  style={{
                    width: '24%',
                    textAlign: 'right',
                    fontSize: 10,
                  }}>
                  {formatCurrency(
                    fixRounding(percentageVats?.[0]?.vat ?? 0, 2),
                    {
                      currency: currentCurrency?.code,
                      excludeCurrencySymbol: true,
                      currencySymbol: currentCurrency?.symbol,
                      companyLang: selectedLng,
                    },
                  )}
                </Text>
              </View>
            ) : (
              percentageVats.map((v, index) => (
                <View
                  style={styles.tableRow}
                  key={`${index}-${v.percentageVat}`}>
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
              {`${translate('Total incl. VAT')} (${
                getCurrencySymbol[currentCurrency?.code!]
              })`}
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
        </View>
      )}

      {previousInvoices.length === 1 && (
        <View
          style={{
            display: 'flex',
            marginTop: 2,
            justifyContent: 'flex-end',
            width: '100%',
            flexDirection: 'row',
          }}>
          <View
            style={{
              borderBottomWidth: 2,
              borderBottomColor: '#212121',
              width: '47%',
            }}
          />
        </View>
      )}

      {hasPreviousInvoices &&
        previousInvoices.length > 1 &&
        invoice?.additionalInfo.showInvoicedSection && (
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

      {hasPayments && invoice?.additionalInfo.showPaymentSection && (
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
        <View style={styles.notesSection}>
          <Text style={styles.sectionHeading}>
            {translate('Payment terms')}
          </Text>
          <HtmlPDF
            html={replacedPaymentTerms}
            rootStyle={{
              marginTop: 6,
              marginBottom: 16,
            }}
          />
        </View>
      )}
    </View>
  );
};

export default PdfPartialPaymentSection;
