import {StyleSheet, Text, View} from '@react-pdf/renderer';
import BigNumber from 'bignumber.js';
import {
  InvoiceAmountDetail,
  InvoiceItemView,
  InvoiceType,
  InvoiceView,
  PaymentType,
} from 'models/invoice';
import {getAggregatedPartialPaymentsVats} from 'pages/InvoiceDetails/utils';
import {calculateTotalAmountInclVats} from 'utils/calculate-total';
import {
  aggregatedAmountToMoney,
  centsToMoney,
  formatCurrency,
  getCurrencySymbol,
} from 'utils/currency';
import {fixRounding} from 'utils/utils';
import {Currency} from 'models/misc';
import {
  getFormattedPaymentValuesForPartialUpfrontAndFinal,
  replacePaymentTermsPlaceholders,
} from 'utils/invoice';
import {HtmlPDF} from 'components/HtmlPDF';
import {useMemo} from 'react';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import PdfPaymentHistorySection from '../PdfPaymentHistorySection';
import PdfPreviewInvoicedSection from './PdfPreviewInvoicedSection';
import PdfPreviewPerItemSection from './PdfPreviewPerItemSection';

type PartialProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  invoice?: InvoiceView;
  invoiceAmountDetail?: InvoiceAmountDetail;
  selectedLng?: string;
  previousInvoices: InvoiceView[];
  articleItems: InvoiceItemView[];
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const getStyles = ({
  boldFontStyle,
  primaryColor,
  secondaryColor,
}: PdfConfigurationStyles) =>
  StyleSheet.create({
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
    notesSection: {
      marginTop: 5,
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
  });

const PdfPreviewUpfrontPaymentSection = ({
  translate,
  currentCurrency,
  invoice,
  invoiceAmountDetail,
  selectedLng,
  previousInvoices,
  articleItems,
  fontStyles,
  primaryColor,
  secondaryColor,
}: PartialProps) => {
  const isEditing = !!invoice?.id;

  const subtotalExclVat = centsToMoney(
    currentCurrency?.code!,
    invoiceAmountDetail?.amountAfterGlobalDiscount.netAmount ?? 0,
  );

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

  const totalAmountExclVat = isEditing
    ? amount +
      previousInvoicesTotalExclVat -
      centsToMoney(currentCurrency?.code!, invoice?.totalAmount?.netAmount)
    : amount + previousInvoicesTotalExclVat;

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
      i.payments.reduce(
        (acc, p) =>
          acc + (p.amount?.value ?? 0) / 10 ** (p.amount?.fractionDigits ?? 2),
        0,
      ),
    )
    .reduce((acc, a) => acc + a, 0);
  const outstandingPayments = BigNumber(totalAmountInclVats)
    .minus(paidAmountInclVats)
    .toNumber();
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

  const styles = getStyles({
    boldFontStyle: fontStyles.bold,
    primaryColor,
    secondaryColor,
  });

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

  const invoicesToRender = !isEditing
    ? previousInvoices
    : previousInvoices.slice(0, -1);

  return (
    <View>
      {invoice?.additionalInfo.payment?.type === PaymentType.PER_ITEM &&
        previousInvoices.length && (
          <PdfPreviewPerItemSection
            translate={translate}
            selectedLng={selectedLng}
            currentCurrency={currentCurrency}
            invoice={invoice}
            previousInvoices={previousInvoices}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            fontStyles={fontStyles}
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
              {` (${getCurrencySymbol[currentCurrency?.code!]})`}
            </Text>
          </View>

          {previousInvoices
            ?.filter((prevInvoice) => prevInvoice.id !== invoice?.id)
            ?.map((previousInvoice) => (
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  flexDirection: 'row',
                  marginVertical: 4,
                }}
                key={previousInvoice.id}>
                <Text
                  style={{
                    textAlign: 'left',
                    color: primaryColor,
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
                      color: primaryColor,
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
                    color: primaryColor,
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

          <View
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              flexDirection: 'row',
              marginVertical: 4,
              borderBottomWidth: 1,
              borderBottomColor: '#212121',
            }}>
            <Text
              style={{
                textAlign: 'left',
                color: primaryColor,
                width: '60%',
              }}>
              {invoice?.type === InvoiceType.CREDIT_NOTE
                ? translate('Credit Note invoice')
                : invoice?.additionalInfo.payment?.description}
            </Text>
            {invoice?.additionalInfo.payment?.type ===
              PaymentType.PERCENTAGE && (
              <Text
                style={{
                  textAlign: 'right',
                  color: primaryColor,
                  width: '15%',
                }}>
                {fixRounding(
                  invoice.additionalInfo.payment?.percentage ?? 0,
                  2,
                )}
                %
              </Text>
            )}

            <Text
              style={{
                textAlign: 'right',
                color: primaryColor,
                width:
                  invoice?.additionalInfo.payment?.type ===
                  PaymentType.PERCENTAGE
                    ? '25%'
                    : '40%',
              }}>
              {formatCurrency(amount, {
                currency: currentCurrency?.code,
                excludeCurrencySymbol: true,
                currencySymbol: currentCurrency?.symbol,
                companyLang: selectedLng,
              })}
            </Text>
          </View>
        </View>
      )}

      <View>
        <View style={styles.tableRow}>
          <Text style={{width: '44%'}} />
          <Text
            style={{
              width: '32%',
              color: secondaryColor,
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
                  color: secondaryColor,
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
                    color: secondaryColor,
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
              color: primaryColor,
              ...fontStyles.bold,
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
              color: primaryColor,
              ...fontStyles.bold,
              fontSize: 10,
            }}>
            {totalAmountInclVatsFormatted}
          </Text>
        </View>
      </View>

      {hasPreviousInvoices &&
        invoice?.additionalInfo.showInvoicedSection &&
        invoicesToRender.length && (
          <PdfPreviewInvoicedSection
            translate={translate}
            currentCurrency={currentCurrency}
            previousInvoices={invoicesToRender}
            amount={amount}
            currentInvoiceAmountPercentageVats={
              currentInvoiceAmountPercentageVats
            }
            fontStyles={fontStyles}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
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
          fontStyles={fontStyles}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
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
            fontStyles={fontStyles}
          />
        </View>
      )}
    </View>
  );
};

export default PdfPreviewUpfrontPaymentSection;
