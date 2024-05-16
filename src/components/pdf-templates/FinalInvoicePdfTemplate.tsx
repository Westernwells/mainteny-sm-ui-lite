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
import {
  Currencies,
  aggregatedAmountToMoney,
  centsToMoney,
  formatCurrency,
} from 'utils/currency';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {
  DiscountType,
  InvoiceItem,
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
  applyGlobalDiscountOnItems,
  applyPerItemDiscountOnItems,
  getAggregatedItemsVats,
  getAggregatedPartialPaymentsVats,
} from 'pages/InvoiceDetails/utils';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
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
import {
  InvoicedSection,
  PaymentHistorySection,
  PerItemPaymentSection,
} from './PartialInvoicePdfTemplate';

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
  articleItems?: InvoiceItem[];
};

type ArticleSectionProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  invoice: InvoiceView;
  allItemsHaveZeroDiscount: boolean;
  discountValue: number;
  subtotalExclVatFormatted: string;
  allItemsHasSameVAT: boolean;
  percentageVats: {
    percentageVat: number;
    vat: number;
  }[];
  totalVAT: number;
  total: number;
  selectedLng?: string;
  netTotal: (articleItem: InvoiceItem) => number;
};

const TableHeading = ({
  text,
  width,
  textAlign,
  marginRight,
}: {
  text: string;
  width: string;
  textAlign: 'left' | 'right' | 'center' | 'justify' | undefined;
  marginRight?: number;
}) => <Text style={{width, textAlign, marginRight, fontSize: 6}}>{text}</Text>;

const ArticleSection = React.memo(
  ({
    invoice,
    currentCurrency,
    translate,
    allItemsHaveZeroDiscount,
    discountValue,
    subtotalExclVatFormatted,
    allItemsHasSameVAT,
    percentageVats,
    totalVAT,
    total,
    selectedLng,
    netTotal,
  }: ArticleSectionProps) => {
    const boldFontStyle = {
      fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
    };

    const regularFontStyle = {
      fontFamily:
        selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
    };

    const styles = getStyles(boldFontStyle, regularFontStyle);
    return (
      <View style={styles.table}>
        <View style={styles.tableHead}>
          <View style={{...styles.tableRow, width: '100%'}}>
            <TableHeading
              text="#"
              width="2%"
              textAlign="left"
              marginRight={8}
            />
            <TableHeading
              text={translate('Article Name')}
              width="46%"
              textAlign="left"
            />
            <TableHeading
              text={translate('Quantity')}
              width="10%"
              textAlign="center"
            />
            <TableHeading
              text={translate('Unit')}
              width="7%"
              textAlign="center"
            />
            <TableHeading
              text={`${translate('Price')} (${currentCurrency?.symbol})`}
              width="15%"
              textAlign="right"
            />
            {!allItemsHaveZeroDiscount && (
              <TableHeading
                text={translate('Discount')}
                width="15%"
                textAlign="right"
              />
            )}
            <TableHeading
              text={`${translate('Total')} (${currentCurrency?.symbol})`}
              width={allItemsHaveZeroDiscount ? '25%' : '15%'}
              textAlign="right"
            />
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
                    style={{width: '40%', textAlign: 'left', color: '#212121'}}>
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
                        10 ** articleItem.unitAmount.fractionDigits ?? 0,
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
                      {articleItem?.additionalInfo?.discount?.percentage !==
                        0 ||
                      articleItem?.additionalInfo?.discount?.amount?.value !== 0
                        ? '-'
                        : ''}
                      {articleItem?.additionalInfo?.discount?.type ===
                      DiscountType.PERCENTAGE
                        ? articleItem?.additionalInfo?.discount.percentage
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
                }}>{`${translate('Discount')} (${
                currentCurrency?.symbol
              })`}</Text>
              <Text style={{width: '24%', textAlign: 'right', fontSize: 10}}>
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
            <Text style={{width: '24%', textAlign: 'right', fontSize: 10}}>
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
                  }}>{`${translate('VAT')} ${
                  percentageVats[0].percentageVat
                }%`}</Text>
                <Text style={{width: '24%', textAlign: 'right', fontSize: 10}}>
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
                    }}>{`${translate('VAT')} ${v.percentageVat}%`}</Text>
                  <Text
                    style={{width: '24%', textAlign: 'right', fontSize: 10}}>
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
              }}>{`${translate('Total incl. VAT')} (${
              currentCurrency?.symbol
            })`}</Text>
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
    );
  },
);

const PartialPaymentSection = React.memo(
  ({
    translate,
    currentCurrency,
    invoice,
    selectedLng,
    previousInvoices,
    articleItems,
  }: PartialProps) => {
    const subtotalExclVatAfterPerItemDiscount =
      calculateTotalWithPerItemDiscount(articleItems!);

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
      invoice.additionalInfo.payment?.type === PaymentType.LUMP_SUM
        ? centsToMoney(
            currentCurrency?.code!,
            aggregatedAmountToMoney(invoice.additionalInfo.payment?.amount)
              .value,
          ) ?? 0
        : invoice.additionalInfo.payment?.type === PaymentType.PERCENTAGE
        ? (subtotalExclVat *
            (invoice.additionalInfo.payment?.percentage ?? 0)) /
          100
        : invoice.additionalInfo.payment?.type === PaymentType.PER_ITEM
        ? articleItems!
            .map(
              (item) =>
                (item.unitAmount.netAmount /
                  10 ** Currencies[item.unitAmount.currency] /
                  100) *
                (item.additionalInfo?.payment?.percentage ?? 0),
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
                amount * (articleItems![0].unitAmount.percentageVat ?? 0 / 100),
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
    });

    const hasPayments =
      previousInvoices.map((i) => i.payments).flat().length > 0;

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
        {invoice.additionalInfo.payment?.type === PaymentType.PER_ITEM && (
          <PerItemPaymentSection
            translate={translate}
            selectedLng={selectedLng}
            currentCurrency={currentCurrency}
            previousInvoices={previousInvoices}
          />
        )}

        {invoice.additionalInfo.payment?.type !== PaymentType.PER_ITEM && (
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

              {invoice.additionalInfo.payment?.type ===
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
                    invoice.additionalInfo.payment?.type ===
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
                {invoice.additionalInfo.payment?.type ===
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
                    (aggregatedAmountToMoney(
                      previousInvoice?.additionalInfo.payment?.amount,
                    ).value ?? 0) /
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
          <InvoicedSection
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
          <PaymentHistorySection
            translate={translate}
            currentCurrency={currentCurrency}
            previousInvoices={previousInvoices}
            totalAmountInclVatsFormatted={totalAmountInclVatsFormatted}
            outstandingAmountFormatted={outstandingAmountFormatted}
            selectedLng={selectedLng}
          />
        )}
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

    const subtotalExclVat = calculateTotalWithPerItemDiscount(articleItems);

    const subtotalExclVatFormatted = formatCurrency(subtotalExclVat, {
      currency: currentCurrency?.code,
    });

    const subtotalExclVatAfterDiscount = applyDiscount({
      actualValue: subtotalExclVat,
      ...(invoice.additionalInfo.discount?.type === DiscountType.AMOUNT
        ? {amount: invoice.additionalInfo.discount?.amount?.value ?? 0}
        : {percentage: invoice.additionalInfo.discount?.percentage ?? 0}),
    });

    const itemsAfterPerItemDiscount = applyPerItemDiscountOnItems(articleItems);

    const itemsAfterGlobalDiscount = applyGlobalDiscountOnItems(
      itemsAfterPerItemDiscount,
      invoice.additionalInfo.discount,
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
        : getAggregatedItemsVats(itemsAfterGlobalDiscount)
      : [];

    // Final/Upfront section calculations
    const discount = getDiscoutObj(invoice?.additionalInfo?.discount);
    const discountAmount = discount?.amount;
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

    const allItemsHaveZeroDiscount = articleItems?.every(
      (item) =>
        item?.additionalInfo?.discount?.amount?.value === 0 ||
        item?.additionalInfo?.discount?.percentage === 0,
    );

    const {total, totalVAT} = calculateSameVatTotals(itemsAfterGlobalDiscount);

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

              <PartialPaymentSection
                translate={translate}
                selectedLng={selectedLng}
                invoice={invoice}
                currentCurrency={currentCurrency}
                previousInvoices={previousInvoices}
                articleItems={articleItems}
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
