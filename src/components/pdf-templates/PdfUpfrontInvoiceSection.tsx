import {StyleSheet, Text, View} from '@react-pdf/renderer';
import BigNumber from 'bignumber.js';
import {
  AggregatedAmount,
  InvoiceAmountDetail,
  InvoiceType,
  InvoiceView,
  PaymentType,
} from 'models/invoice';
import {
  aggregatedAmountToMoney,
  centsToMoney,
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
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import PdfInvoicedSection from './PdfInvoicedSection';
import PdfPaymentHistorySection from './PdfPaymentHistorySection';
import PdfPerItemSection from './PdfPerItemSection';

type PartialProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  invoice?: InvoiceView;
  invoiceAmountDetail?: InvoiceAmountDetail;
  selectedLng?: string;
  previousInvoices: InvoiceView[];
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
      marginVertical: 2,
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

const PdfUpfrontInvoiceSection = ({
  translate,
  currentCurrency,
  invoice,
  invoiceAmountDetail,
  selectedLng,
  previousInvoices,
  fontStyles,
  primaryColor,
  secondaryColor,
}: PartialProps) => {
  const previousInvoicesTotalExclVat = previousInvoices
    ?.map(
      (i) =>
        (i.totalAmount?.netAmount ?? 0) /
        10 ** (i.totalAmount?.fractionDigits ?? 2),
    )
    .reduce((a, b) => a + b, 0);

  const amount = centsToMoney(
    currentCurrency?.code!,
    (invoiceAmountDetail?.payment?.amount as AggregatedAmount)?.netAmount ?? 0,
  );

  const totalAmountExclVat =
    amount +
    previousInvoicesTotalExclVat -
    (invoice?.totalAmount?.netAmount ?? 0) /
      10 ** (invoice?.totalAmount?.fractionDigits ?? 2);

  const totalAmountExclVatFormatted = formatCurrency(totalAmountExclVat, {
    currency: currentCurrency?.code,
    excludeCurrencySymbol: true,
    currencySymbol: currentCurrency?.symbol,
    companyLang: selectedLng,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const percentageVats =
    (invoiceAmountDetail?.payment?.amount as AggregatedAmount)?.vats ?? [];

  const totalAmountInclVats =
    (percentageVats
      ?.map((v) => centsToMoney(currentCurrency?.code!, v.vat))
      ?.reduce((a, b) => a + b, 0) ?? 0) + totalAmountExclVat;

  const totalAmountInclVatsFormatted = formatCurrency(totalAmountInclVats, {
    currency: currentCurrency?.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    excludeCurrencySymbol: true,
    currencySymbol: currentCurrency?.symbol,
    companyLang: selectedLng,
  });

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

  const hasPayments =
    previousInvoices
      .map((i) =>
        i.payments?.filter((payment) => payment.meta.state === State.ACTIVE),
      )
      .flat().length > 0;

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
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            fontStyles={fontStyles}
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
          </View>
        )}

      {previousInvoices.length && (
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
            {percentageVats.map((v, index) => (
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
                  {formatCurrency(centsToMoney(currentCurrency?.code!, v.vat), {
                    currency: currentCurrency?.code,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    excludeCurrencySymbol: true,
                    companyLang: selectedLng,
                    currencySymbol: currentCurrency?.symbol,
                  })}
                </Text>
              </View>
            ))}
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
      )}

      {hasPreviousInvoices &&
        previousInvoices.length > 1 &&
        invoice?.additionalInfo.showInvoicedSection && (
          <PdfInvoicedSection
            translate={translate}
            currentCurrency={currentCurrency}
            previousInvoices={previousInvoices}
            amount={amount}
            percentageVats={percentageVats}
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

export default PdfUpfrontInvoiceSection;
