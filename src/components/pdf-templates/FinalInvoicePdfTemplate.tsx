import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import React from 'react';
import {formatDate, toDate} from 'utils/datetime';
import {Currencies, centsToMoney, formatCurrency} from 'utils/currency';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {
  DiscountType,
  InvoiceItem,
  InvoiceType,
  InvoiceView,
  PaymentType,
} from 'models/invoice';
import {
  calculateLaborMaterialCost,
  fixRounding,
  formatCostText,
} from 'utils/utils';
import {
  calculateSameVatTotals,
  calculateTotalAmountInclVats,
  calculateTotalWithPerItemDiscount,
} from 'utils/calculate-total';
import {
  applyDiscount,
  getAggregatedPartialPaymentsVats,
} from 'pages/InvoiceDetails/utils';
import {
  applyGlobalDiscountOnQuotationItems,
  applyPerItemDiscountOnQuotationItems,
  applyQuotationDiscount,
  getDiscoutObj,
  getQuotationAggregatedItemsVats,
} from 'pages/QuotationDetails/utils';
import {
  getFormattedPaymentValues,
  replacePaymentTermsPlaceholders,
} from 'utils/invoice';
import {ArticleType} from 'models/article';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import PdfTemplateInvoiceDetails from './PdfTemplateInvoiceDetails';

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
      color: '#616161',
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
      marginVertical: 4,
    },
    tableRow: {
      display: 'flex',
      flexDirection: 'row',
      fontSize: 10,
      marginBottom: 8,
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
  logoSrc?: string;
  currentCurrency?: Currency;
  logoDimensions?: {
    width: number;
    height: number;
  } | null;
  invoice: InvoiceView;
  previousInvoices: InvoiceView[];
  selectedLng?: string;
};

type PartialProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  invoice: InvoiceView;
  selectedLng?: string;
  previousInvoices: InvoiceView[];
};

type InvoicedSectionProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  selectedLng?: string;
  previousInvoices: InvoiceView[];
  amount: number;
  currentInvoiceAmountPercentageVats: {
    percentageVat: number;
    vat: number;
  }[];
};

type PaymentHistorySectionProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  previousInvoices: InvoiceView[];
  totalAmountInclVatsFormatted: string;
  outstandingAmountFormatted: string;
  selectedLng?: string;
};

const PartialPaymentSection = React.memo(
  ({
    translate,
    currentCurrency,
    invoice,
    selectedLng,
    previousInvoices,
  }: PartialProps) => {
    const subtotalExclVatAfterPerItemDiscount =
      calculateTotalWithPerItemDiscount(previousInvoices[0]?.items);
    const subtotalExclVat = applyDiscount({
      actualValue: subtotalExclVatAfterPerItemDiscount,
      ...(invoice?.discount?.type === DiscountType.AMOUNT
        ? {amount: invoice?.discount?.amount?.value ?? 0}
        : {percentage: invoice?.discount?.percentage ?? 0}),
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
        ? (invoice?.additionalInfo.payment?.amount?.netAmount ?? 0) /
            10 **
              (invoice.additionalInfo.payment.amount?.fractionDigits ?? 2) ?? 0
        : invoice?.additionalInfo.payment?.type === PaymentType.PERCENTAGE
        ? (subtotalExclVat *
            (invoice?.additionalInfo.payment?.percentage ?? 0)) /
          100
        : invoice?.additionalInfo.payment?.type === PaymentType.PER_ITEM
        ? previousInvoices &&
          previousInvoices[0]?.items
            ?.map(
              (item) =>
                (item.unitAmount.netAmount /
                  10 ** Currencies[item.unitAmount.currency] /
                  100) *
                (item?.additionalInfo?.payment?.percentage ?? 0),
            )
            .reduce((a, b) => a + b, 0)
        : 0;

    const totalAmountExclVat =
      amount +
      previousInvoicesTotalExclVat -
      (invoice.totalAmount?.netAmount ?? 0) /
        10 ** (invoice.totalAmount?.fractionDigits ?? 2);

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

    const allItemsHasSameVAT = previousInvoices[0]?.items.every(
      (item) =>
        item.unitAmount.percentageVat ===
        previousInvoices[0].items[0].unitAmount.percentageVat,
    );

    const percentageVats = previousInvoices[0]?.items.length
      ? allItemsHasSameVAT
        ? [
            {
              percentageVat:
                previousInvoices[0]?.items[0].unitAmount.percentageVat,
              vat:
                totalAmountExclVat *
                (previousInvoices[0].items[0].unitAmount.percentageVat / 100),
            },
          ]
        : getAggregatedPartialPaymentsVats(
            previousInvoices[0]?.items,
            totalAmountExclVat,
          )
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

    const boldFontStyle = {
      fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
    };

    const regularFontStyle = {
      fontFamily:
        selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
    };

    const styles = getStyles(boldFontStyle, regularFontStyle);

    return (
      <View wrap={false}>
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
            }}>
            {translate('Partial Invoices')}
          </Text>
          <Text
            style={{
              ...styles.tableHeading,
              textAlign: 'right',
            }}>
            {translate('Total')}
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
              borderBottomWidth: index === previousInvoices.length - 1 ? 1 : 0,
              borderBottomColor: '#212121',
            }}
            wrap={false}
            key={previousInvoice.id}>
            <Text
              style={{
                textAlign: 'left',
                color: '#212121',
              }}>
              {previousInvoice.additionalInfo.payment?.description}
            </Text>
            <Text
              style={{
                textAlign: 'right',
                color: '#212121',
              }}>
              {formatCurrency(
                (previousInvoice?.additionalInfo.payment?.amount?.netAmount ??
                  0) /
                  10 **
                    (previousInvoice?.additionalInfo.payment?.amount
                      ?.fractionDigits ?? 2),
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

        <View
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            flexDirection: 'row',
          }}>
          <View
            style={{
              borderTopWidth: 2,
              borderTopColor: '#212121',
              width: '50%',
            }}
          />
        </View>
      </View>
    );
  },
);

const InvoicedSection = React.memo(
  ({
    translate,
    currentCurrency,
    selectedLng,
    previousInvoices,
    amount,
    currentInvoiceAmountPercentageVats,
  }: InvoicedSectionProps) => {
    const amountFormatted = formatCurrency(fixRounding(amount, 2), {
      currency: currentCurrency?.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      roundingMode: 'floor',
      excludeCurrencySymbol: true,
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
    });

    const invoicedSectionColumns: {
      name: string;
      align: 'left' | 'right' | 'center' | 'justify' | undefined;
      width: string;
    }[] = [
      {name: 'Invoiced', align: 'left', width: '30%'},
      {name: 'Date', align: 'right', width: '15%'},
      {
        name: `Total (${currentCurrency?.symbol})`,
        align: 'right',
        width: '18%',
      },
      {name: 'VAT (%)', align: 'right', width: '7%'},
      {name: 'VAT', align: 'right', width: '12%'},
      {
        name: `Total incl. VAT (${currentCurrency?.symbol})`,
        align: 'right',
        width: '20%',
      },
    ];

    const boldFontStyle = {
      fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
    };

    const regularFontStyle = {
      fontFamily:
        selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
    };

    const styles = getStyles(boldFontStyle, regularFontStyle);

    return (
      <View>
        <View
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row',
            width: '100%',
            marginTop: 15,
            marginBottom: 10,
          }}>
          {invoicedSectionColumns.map((column) => (
            <Text
              style={{
                ...styles.tableHeading,
                textAlign: column.align,
                width: column.width,
              }}
              key={column.name}>
              {translate(column.name)}
            </Text>
          ))}
        </View>

        <View>
          {previousInvoices.map((i, index) => {
            if (index === previousInvoices.length - 1) {
              return null;
            }
            const invoiceTotalAmount = i.totalAmount;
            const description = i.additionalInfo?.payment?.description;
            const fractionDigits = invoiceTotalAmount?.fractionDigits ?? 2;
            const amountExclVat = Math.abs(
              (invoiceTotalAmount?.netAmount ?? 0) / 10 ** fractionDigits,
            );
            const amountExclVatFormatted = formatCurrency(amountExclVat, {
              currency: currentCurrency?.code,
              minimumFractionDigits: fractionDigits,
              maximumFractionDigits: fractionDigits,
              roundingMode: 'floor',
              excludeCurrencySymbol: true,
              currencySymbol: currentCurrency?.symbol,
              companyLang: selectedLng,
            });
            const totalAmountInclVat = Math.abs(
              (invoiceTotalAmount?.grossAmount ?? 0) / 10 ** fractionDigits,
            );
            const totalAmountInclVatFormatted = formatCurrency(
              totalAmountInclVat,
              {
                currency: currentCurrency?.code,
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
                roundingMode: 'floor',
                excludeCurrencySymbol: true,
                currencySymbol: currentCurrency?.symbol,
                companyLang: selectedLng,
              },
            );
            const signBeforeNumber =
              i.type === InvoiceType.CREDIT_NOTE ? '+' : '-';

            return (
              <View
                key={i.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  width: '100%',
                }}>
                <Text style={{...styles.tableRow, width: '30%'}}>
                  {description}
                </Text>
                <Text
                  style={{
                    ...styles.tableRow,
                    width: '15%',
                    textAlign: 'right',
                  }}>
                  {i.sentDate ? formatDate(toDate(i.sentDate)) : '-'}
                </Text>
                <Text
                  style={{
                    ...styles.tableRow,
                    width: '18%',
                    textAlign: 'right',
                  }}>
                  {signBeforeNumber}
                  {amountExclVatFormatted}
                </Text>
                <View
                  style={{
                    ...styles.tableRow,
                    flexDirection: 'column',
                    width: '7%',
                    textAlign: 'right',
                    display: 'flex',
                  }}>
                  {invoiceTotalAmount.vats.map((v, idx) => (
                    <Text key={idx} style={{marginBottom: 3}}>
                      {v.percentageVat}%
                    </Text>
                  ))}
                </View>
                <View
                  style={{
                    ...styles.tableRow,
                    width: '12%',
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                  {invoiceTotalAmount.vats.map((v, idx) => {
                    const vatAmount = Math.abs(
                      (v?.vat ?? 0) / 10 ** fractionDigits,
                    );
                    const vatAmountFormatted = formatCurrency(vatAmount, {
                      currency: currentCurrency?.code,
                      minimumFractionDigits: fractionDigits,
                      maximumFractionDigits: fractionDigits,
                      roundingMode: 'floor',
                      excludeCurrencySymbol: true,
                      currencySymbol: currentCurrency?.symbol,
                      companyLang: selectedLng,
                    });
                    return (
                      <Text key={idx} style={{marginBottom: 3}}>
                        -{vatAmountFormatted}
                      </Text>
                    );
                  })}
                </View>
                <Text
                  style={{
                    ...styles.tableRow,
                    width: '20%',
                    textAlign: 'right',
                  }}>
                  {signBeforeNumber}
                  {totalAmountInclVatFormatted}
                </Text>
              </View>
            );
          })}

          <View
            style={{
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              borderTopWidth: 1,
              borderTopColor: '#212121',
              paddingTop: 3,
            }}>
            <Text style={{width: '30%', ...boldFontStyle}}>
              {translate('Invoice amount')}
            </Text>
            <Text style={{width: '15%', textAlign: 'right'}} />
            <Text style={{width: '18%', textAlign: 'right', ...boldFontStyle}}>
              {amountFormatted}
            </Text>
            <View
              style={{
                ...boldFontStyle,
                width: '7%',
                textAlign: 'right',
                alignItems: 'flex-end',
              }}>
              {currentInvoiceAmountPercentageVats.map((v, idx) => (
                <Text key={idx} style={{marginBottom: 3}}>
                  {v.percentageVat}%
                </Text>
              ))}
            </View>
            <View
              style={{
                width: '12%',
                textAlign: 'right',
                alignItems: 'flex-end',
              }}>
              {currentInvoiceAmountPercentageVats.map((v, idx) => {
                const vatAmountFormatted = formatCurrency(
                  centsToMoney(currentCurrency?.code!, v.vat),
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
                return (
                  <Text key={idx} style={{marginBottom: 3, ...boldFontStyle}}>
                    {vatAmountFormatted}
                  </Text>
                );
              })}
            </View>
            <Text style={{width: '20%', textAlign: 'right', ...boldFontStyle}}>
              {formatCurrency(
                amount +
                  currentInvoiceAmountPercentageVats
                    .map((v) => centsToMoney(currentCurrency?.code!, v.vat))
                    .reduce((a, b) => a + b, 0),
                {
                  currency: currentCurrency?.code,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  roundingMode: 'floor',
                  excludeCurrencySymbol: true,
                  currencySymbol: currentCurrency?.symbol,
                  companyLang: selectedLng,
                },
              )}
            </Text>
          </View>
        </View>
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
              width: '17%',
            }}
          />
        </View>
      </View>
    );
  },
);

const PaymentHistorySection = React.memo(
  ({
    translate,
    currentCurrency,
    previousInvoices,
    totalAmountInclVatsFormatted,
    outstandingAmountFormatted,
    selectedLng,
  }: PaymentHistorySectionProps) => {
    const paymentHistorySectionColumns: {
      name: string;
      align: 'left' | 'right' | 'center' | 'justify' | undefined;
      width: string;
    }[] = [
      {name: 'Payment History', align: 'left', width: '60%'},
      {name: 'Date', align: 'right', width: '10%'},
      {
        name: `Total (${currentCurrency?.symbol})`,
        align: 'right',
        width: '30%',
      },
    ];

    const boldFontStyle = {
      fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
    };

    const regularFontStyle = {
      fontFamily:
        selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
    };

    const styles = getStyles(boldFontStyle, regularFontStyle);

    return (
      <View>
        <View>
          <View
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'row',
              width: '100%',
              marginTop: 15,
              marginBottom: 10,
            }}>
            {paymentHistorySectionColumns.map((column) => (
              <Text
                style={{
                  ...styles.tableHeading,
                  textAlign: column.align,
                  width: column.width,
                }}
                key={column.name}>
                {translate(column.name)}
              </Text>
            ))}
          </View>

          <View>
            <View
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'row',
                width: '100%',
                marginBottom: 10,
              }}>
              <Text style={{width: '60%', textAlign: 'left'}}>
                {translate('Total amount (incl. VAT)')}
              </Text>
              <Text style={{width: '10%', textAlign: 'right'}} />

              <Text style={{width: '30%', textAlign: 'right'}}>
                {totalAmountInclVatsFormatted}
              </Text>
            </View>

            {previousInvoices?.map((i) => {
              if (!i.payments.length) {
                return null;
              }

              const description = i.additionalInfo?.payment?.description || '-';

              const totalPriceInclVat = Math.abs(
                i.payments
                  .map(
                    (p) =>
                      (p.amount?.value ?? 0) /
                      10 ** (p.amount?.fractionDigits ?? 2),
                  )
                  .reduce((a, b) => a + b, 0),
              );

              const totalPriceInclVatFormatted = formatCurrency(
                totalPriceInclVat,
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

              const signBeforeNumber =
                i.type === InvoiceType.CREDIT_NOTE ? '+' : '-';

              return (
                <View
                  key={i.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    width: '100%',
                  }}>
                  <Text
                    style={{
                      ...styles.tableRow,
                      width: '60%',
                      textAlign: 'left',
                    }}>
                    {description}
                  </Text>
                  <Text
                    style={{
                      ...styles.tableRow,
                      width: '10%',
                      textAlign: 'right',
                    }}>
                    {i.sentDate ? formatDate(toDate(i.sentDate)) : '-'}
                  </Text>
                  <Text
                    style={{
                      ...styles.tableRow,
                      width: '30%',
                      textAlign: 'right',
                    }}>
                    {signBeforeNumber}
                    {totalPriceInclVatFormatted}
                  </Text>
                </View>
              );
            })}

            <View
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'row',
                width: '100%',
                marginBottom: 10,
                borderTopWidth: 1,
                borderTopColor: '#212121',
              }}>
              <Text style={{width: '60%', textAlign: 'left', ...boldFontStyle}}>
                {translate('Outstanding payments')}
              </Text>
              <Text style={{width: '10%', textAlign: 'right'}} />
              <Text
                style={{width: '40%', textAlign: 'right', ...boldFontStyle}}>
                {outstandingAmountFormatted}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  },
);

const FinalInvoicePdfTemplate = React.memo(
  ({
    translate,
    userInfo,
    logoSrc,
    currentCurrency,
    logoDimensions,
    invoice,
    selectedLng,
    previousInvoices,
  }: Props) => {
    const articleItems = invoice?.items.map((item) => ({
      ...item,
      discount: getDiscoutObj(item?.additionalInfo?.discount),
    }));

    const discount = getDiscoutObj(invoice?.additionalInfo?.discount);
    const discountType = discount?.type;
    const discountAmount = discount?.amount;
    const discountPercentage = discount?.percentage;
    const discountValue = discountAmount?.value ?? 0;

    const netTotal = (articleItem: InvoiceItem) => {
      const grossTotal =
        (articleItem.unitAmount?.netAmount ?? 0) * articleItem.quantity;
      const itemDiscountValue =
        articleItem?.additionalInfo?.discount?.amount?.value ?? 0;

      return (
        (grossTotal - itemDiscountValue) /
          10 ** articleItem.unitAmount.fractionDigits ?? 2
      );
    };

    const subtotalExclVatAfterPerItemDiscount =
      calculateTotalWithPerItemDiscount(invoice?.items!);

    const subtotalExclVat = applyDiscount({
      actualValue: subtotalExclVatAfterPerItemDiscount,
      ...(invoice?.discount?.type === DiscountType.AMOUNT
        ? {amount: invoice?.discount?.amount?.value ?? 0}
        : {percentage: invoice?.discount?.percentage ?? 0}),
    });

    const previousInvoicesTotalExclVat =
      previousInvoices
        ?.map(
          (i) =>
            (i.totalAmount?.netAmount ?? 0) /
            10 ** (i.totalAmount?.fractionDigits ?? 2),
        )
        .reduce((a, b) => a + b, 0) ?? 0;

    const amount =
      invoice?.additionalInfo.payment?.type === PaymentType.LUMP_SUM
        ? centsToMoney(
            currentCurrency?.code!,
            invoice.additionalInfo.payment?.amount?.netAmount,
          )
        : invoice?.additionalInfo.payment?.type === PaymentType.PERCENTAGE
        ? (subtotalExclVat *
            (invoice?.additionalInfo.payment?.percentage ?? 0)) /
          100
        : invoice?.additionalInfo.payment?.type === PaymentType.PER_ITEM
        ? invoice?.items
            .map(
              (item) =>
                (item.unitAmount.netAmount /
                  10 ** Currencies[item.unitAmount.currency] /
                  100) *
                (item.additionalInfo?.payment?.percentage ?? 0),
            )
            .reduce((a, b) => a + b, 0)
        : 0;

    const allItemsHaveZeroDiscount = articleItems?.every(
      (item) =>
        item?.additionalInfo?.discount?.amount?.value === 0 ||
        item?.additionalInfo?.discount?.percentage === 0,
    );

    const totalAmountExclVat =
      amount +
      previousInvoicesTotalExclVat -
      (invoice.totalAmount?.netAmount ?? 0) /
        10 ** (invoice.totalAmount?.fractionDigits ?? 2);

    const subtotalExclVatFormatted = formatCurrency(
      subtotalExclVat - discountValue,
      {
        currency: currentCurrency?.code,
        excludeCurrencySymbol: true,
        currencySymbol: currentCurrency?.symbol,
        companyLang: selectedLng,
      },
    );

    const subtotalExclVatAfterDiscount = applyQuotationDiscount({
      actualValue: subtotalExclVat,
      ...(discountType === DiscountType.AMOUNT
        ? {amount: discountValue ?? 0}
        : {percentage: discountPercentage ?? 0}),
    });

    const itemsAfterPerItemDiscount =
      applyPerItemDiscountOnQuotationItems(articleItems);

    const itemsAfterGlobalDiscount = applyGlobalDiscountOnQuotationItems(
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
              percentageVat:
                itemsAfterGlobalDiscount[0].unitAmount.percentageVat,
              vat:
                subtotalExclVatAfterDiscount *
                (itemsAfterGlobalDiscount[0].unitAmount.percentageVat / 100),
            },
          ]
        : getQuotationAggregatedItemsVats(itemsAfterGlobalDiscount)
      : [];

    const {total, totalVAT} = calculateSameVatTotals(itemsAfterGlobalDiscount);

    const currentInvoiceAmountPercentageVats = invoice?.items.length
      ? allItemsHasSameVAT
        ? [
            {
              percentageVat: invoice?.items[0].unitAmount.percentageVat,
              vat:
                amount *
                (invoice?.items[0].unitAmount.percentageVat ?? 0 / 100),
            },
          ]
        : getAggregatedPartialPaymentsVats(invoice?.items, amount)
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

    const formattedPaymentValues = getFormattedPaymentValues(
      invoice?.additionalInfo.paymentTerm!,
      invoice!,
      total,
      currentCurrency,
      selectedLng,
    );

    const laborCost = calculateLaborMaterialCost(
      articleItems,
      ArticleType.LABOR,
    );

    const materialCost = calculateLaborMaterialCost(
      articleItems,
      ArticleType.MATERIAL,
    );

    const boldFontStyle = {
      fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
    };

    const regularFontStyle = {
      fontFamily:
        selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
    };

    const styles = getStyles(boldFontStyle, regularFontStyle);

    const paidAmountInclVats = previousInvoices
      ?.map((i) =>
        i.payments.reduce(
          (acc, p) =>
            acc +
            (p.amount?.value ?? 0) / 10 ** (p.amount?.fractionDigits ?? 2),
          0,
        ),
      )
      .reduce((acc, a) => acc + a, 0);
    const outstandingPayments = totalAmountInclVats - (paidAmountInclVats ?? 0);

    const outstandingAmountFormatted = formatCurrency(outstandingPayments, {
      currency: currentCurrency?.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      roundingMode: 'floor',
      excludeCurrencySymbol: true,
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
    });

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
                  invoice?.propertyOwner?.billingAddress?.component
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
              <Text style={styles.contentHeader}>
                {translate('Final Invoice')}
              </Text>
              {invoice?.description.trim() !== '' && (
                <Text style={styles.contentBody}>{invoice?.description}</Text>
              )}
              <View style={styles.table}>
                <View style={styles.tableHead}>
                  <View style={styles.tableRow}>
                    <Text
                      style={{
                        width: '2%',
                        textAlign: 'left',
                        marginRight: 10,
                        ...styles.tableHeading,
                      }}>
                      #
                    </Text>
                    <Text
                      style={{
                        width: '40%',
                        textAlign: 'left',
                        ...styles.tableHeading,
                      }}>
                      {translate('Article Name')}
                    </Text>

                    <Text
                      style={{
                        width: '10%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {translate('Quantity')}
                    </Text>
                    <Text
                      style={{
                        width: '8%',
                        textAlign: 'center',
                        marginLeft: 10,
                        ...styles.tableHeading,
                      }}>
                      {translate('Unit')}
                    </Text>
                    <Text
                      style={{
                        width: '15%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {`${translate('Price')} (${currentCurrency?.symbol})`}
                    </Text>

                    {!allItemsHaveZeroDiscount && (
                      <Text
                        style={{
                          width: '10%',
                          textAlign: 'right',
                          ...styles.tableHeading,
                        }}>
                        {translate('Discount')}
                      </Text>
                    )}

                    <Text
                      style={{
                        width: allItemsHaveZeroDiscount ? '25%' : '15%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {' '}
                      {`${translate('Total')} (${currentCurrency?.symbol})`}
                    </Text>
                  </View>
                </View>

                {invoice.items.length > 0 && (
                  <View style={styles.dataBody}>
                    {invoice.items?.map((articleItem, index) => (
                      <View key={`${articleItem.id} - ${index}`}>
                        <View style={styles.tableRow}>
                          <Text
                            style={{
                              width: '2%',
                              textAlign: 'left',
                              marginRight: 10,
                              color: '#212121',
                            }}>
                            {index + 1}
                          </Text>
                          <Text
                            style={{
                              width: '40%',
                              textAlign: 'left',
                              color: '#212121',
                            }}>
                            {articleItem.name || '-'}
                          </Text>

                          <Text
                            style={{
                              width: '10%',
                              textAlign: 'right',
                              color: '#212121',
                            }}>
                            {articleItem.quantity || '-'}
                          </Text>
                          <Text
                            style={{
                              width: '8%',
                              textAlign: 'center',
                              marginLeft: 10,
                              color: '#212121',
                            }}>
                            {translate(articleItem?.article?.unit!) || '-'}
                          </Text>
                          <Text
                            style={{
                              width: '15%',
                              textAlign: 'right',
                              color: '#212121',
                            }}>
                            {formatCurrency(
                              (articleItem?.unitAmount?.netAmount ?? 0) /
                                10 ** articleItem.unitAmount.fractionDigits ??
                                0,
                              {
                                currency: currentCurrency?.code,
                                excludeCurrencySymbol: true,
                                currencySymbol: currentCurrency?.symbol,
                                companyLang: selectedLng,
                              },
                            )}
                          </Text>

                          {!allItemsHaveZeroDiscount && (
                            <Text
                              style={{
                                width: '10%',
                                textAlign: 'right',
                                color: '#212121',
                              }}>
                              {articleItem?.additionalInfo?.discount
                                ?.percentage !== 0 ||
                              articleItem?.additionalInfo?.discount?.amount
                                ?.value !== 0
                                ? '-'
                                : ''}
                              {articleItem?.additionalInfo?.discount?.type ===
                              DiscountType.PERCENTAGE
                                ? articleItem?.additionalInfo?.discount
                                    .percentage
                                : (articleItem?.additionalInfo?.discount?.amount
                                    ?.value || 0) /
                                  10 ** 2}
                              {articleItem?.additionalInfo?.discount?.type ===
                              DiscountType.AMOUNT
                                ? currentCurrency?.symbol
                                : '%'}
                            </Text>
                          )}

                          <Text
                            style={{
                              width: allItemsHaveZeroDiscount ? '25%' : '15%',
                              textAlign: 'right',
                              color: '#212121',
                            }}>
                            {formatCurrency(netTotal(articleItem), {
                              currency: currentCurrency?.code,
                              excludeCurrencySymbol: true,
                              currencySymbol: currentCurrency?.symbol,
                              companyLang: selectedLng,
                            })}
                          </Text>
                        </View>
                        {articleItem?.description.trim() && (
                          <Text style={styles.descriptionText}>
                            {articleItem?.description}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                <View>
                  {discountValue && (
                    <View style={styles.tableRow}>
                      <Text style={{width: '44%'}} />
                      <Text
                        style={{
                          width: '32%',
                          color: '#616161',
                          fontSize: 10,
                          textAlign: 'right',
                        }}>
                        {`${translate('Discount')} (${
                          currentCurrency?.symbol
                        })`}
                      </Text>
                      <Text
                        style={{
                          width: '24%',
                          textAlign: 'right',
                          fontSize: 10,
                        }}>
                        -
                        {formatCurrency(discountValue, {
                          currency: currentCurrency?.code,
                          excludeCurrencySymbol: true,
                          currencySymbol: currentCurrency?.symbol,
                          companyLang: selectedLng,
                        })}
                      </Text>
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
                      {subtotalExclVatFormatted}
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
                          {translate('VAT')} {percentageVats[0].percentageVat}%
                        </Text>
                        <Text
                          style={{
                            width: '24%',
                            textAlign: 'right',
                            fontSize: 10,
                          }}>
                          {formatCurrency(totalVAT, {
                            currency: currentCurrency?.code,
                            excludeCurrencySymbol: true,
                            currencySymbol: currentCurrency?.symbol,
                            companyLang: selectedLng,
                          })}
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
                      }}>
                      {`${translate('Total incl. VAT')} (${
                        currentCurrency?.symbol
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
                      {formatCurrency(total, {
                        currency: currentCurrency?.code,
                        excludeCurrencySymbol: true,
                        currencySymbol: currentCurrency?.symbol,
                        companyLang: selectedLng,
                      })}
                    </Text>
                  </View>
                </View>
              </View>
              <PartialPaymentSection
                translate={translate}
                selectedLng={selectedLng}
                invoice={invoice}
                currentCurrency={currentCurrency}
                previousInvoices={previousInvoices}
              />
              <InvoicedSection
                translate={translate}
                currentCurrency={currentCurrency}
                previousInvoices={previousInvoices}
                amount={amount}
                currentInvoiceAmountPercentageVats={
                  currentInvoiceAmountPercentageVats
                }
              />

              <PaymentHistorySection
                translate={translate}
                currentCurrency={currentCurrency}
                previousInvoices={previousInvoices}
                totalAmountInclVatsFormatted={totalAmountInclVatsFormatted}
                outstandingAmountFormatted={outstandingAmountFormatted}
                selectedLng={selectedLng}
              />

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

              {invoice?.additionalInfo?.moreInfo?.trim() && (
                <View wrap={false}>
                  <Text style={styles.sectionHeading}>
                    {translate('Notes')}
                  </Text>
                  <Text>
                    {formatCostText(
                      invoice?.additionalInfo?.moreInfo,
                      laborCost !== 0
                        ? `${formatCurrency(laborCost, {
                            currency: currentCurrency?.code,
                            currencySymbol: currentCurrency?.symbol,
                            companyLang: selectedLng,
                          })}`
                        : '',
                      materialCost !== 0
                        ? `${formatCurrency(materialCost, {
                            currency: currentCurrency?.code,
                            currencySymbol: currentCurrency?.symbol,
                            companyLang: selectedLng,
                          })}`
                        : '',
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
  },
);

export default FinalInvoicePdfTemplate;
