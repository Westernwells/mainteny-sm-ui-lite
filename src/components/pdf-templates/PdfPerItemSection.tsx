import {StyleSheet, Text, View} from '@react-pdf/renderer';
import {
  InvoiceAmountDetail,
  InvoiceItemPaymentRecord,
  InvoiceView,
} from 'models/invoice';
import {centsToMoney, formatCurrency, getCurrencySymbol} from 'utils/currency';
import {Currency} from 'models/misc';
import {HtmlPDF} from 'components/HtmlPDF';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';

type PerItemPaymentProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  selectedLng?: string;
  invoice?: InvoiceView;
  previousInvoices: InvoiceView[];
  invoiceAmountDetail?: InvoiceAmountDetail;
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const createStyles = ({secondaryColor}: PdfConfigurationStyles) => {
  const baseRow = {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    width: '100%' as const,
  };

  return StyleSheet.create({
    container: {width: '100%' as const},
    headerRow: {
      ...baseRow,
      alignItems: 'center' as const,
      marginTop: 20,
      paddingBottom: 3,
    },
    headerCell: {
      fontSize: 6,
      textTransform: 'uppercase' as const,
      color: secondaryColor,
    },
    rowContainer: {
      ...baseRow,
      marginVertical: 4,
      paddingBottom: 3,
    },
    cellIndex: {width: '4%' as const, textAlign: 'left' as const},
    cellName: {width: '36%' as const},
    cellPrice: {width: '18%' as const, textAlign: 'right' as const},
    cellPortion: {width: '15%' as const, textAlign: 'right' as const},
    cellAmount: {width: '25%' as const, textAlign: 'right' as const},
    descriptionContainer: {paddingVertical: 3},
    subjectDivider: {
      borderBottomWidth: 1,
      borderBottomColor: '#212121',
      marginBottom: 2,
    },
    subjectContainer: {paddingVertical: 2},
  });
};

const TableHeader = ({
  translate,
  currency,
  styles,
}: {
  translate: (key: string) => string;
  currency?: Currency;
  styles: ReturnType<typeof createStyles>;
}) => (
  <View style={styles.headerRow}>
    <Text style={[styles.headerCell, styles.cellIndex]}>#</Text>
    <Text style={[styles.headerCell, styles.cellName]}>
      {translate('Article name')}
    </Text>
    <Text style={[styles.headerCell, styles.cellPrice]}>
      {`${translate('Price')} (${getCurrencySymbol[currency?.code!]})`}
    </Text>
    <Text style={[styles.headerCell, styles.cellPortion]}>
      {translate('Portion')} %
    </Text>
    <Text style={[styles.headerCell, styles.cellAmount]}>
      {`${translate('Amount')} (${getCurrencySymbol[currency?.code!]})`}
    </Text>
  </View>
);

const ItemRow = ({
  item,
  paymentDetail,
  index,
  currency,
  selectedLng,
  primaryColor,
  fontStyles,
  styles,
  isPreviousInvoices,
}: {
  item: InvoiceView['items'][0];
  paymentDetail?: InvoiceItemPaymentRecord;
  index: number;
  currency?: Currency;
  selectedLng?: string;
  primaryColor: string;
  fontStyles: ContextProps['fontStyles'];
  styles: ReturnType<typeof createStyles>;
  isPreviousInvoices?: boolean;
}) => {
  const netAmount = item.unitAmount?.netAmount ?? 0;

  const priceExclVat = formatCurrency(
    centsToMoney(currency?.code!, netAmount),
    {
      currency: currency?.code!,
      excludeCurrencySymbol: true,
      currencySymbol: currency?.symbol,
      companyLang: selectedLng,
    },
  );

  const paymentInfo = isPreviousInvoices
    ? item.additionalInfo?.payment
    : paymentDetail;

  const portion = paymentInfo?.percentage ?? 0;

  const amountNet = paymentInfo?.amount?.netAmount ?? 0;

  const amount = formatCurrency(centsToMoney(currency?.code!, amountNet), {
    currency: currency?.code,
    excludeCurrencySymbol: true,
    currencySymbol: currency?.symbol,
    companyLang: selectedLng,
  });

  return (
    <View key={item.id} style={styles.rowContainer}>
      <Text style={styles.cellIndex}>{index + 1}</Text>
      <View style={styles.cellName}>
        <HtmlPDF html={item.name || ''} fontStyles={fontStyles} />
      </View>
      <Text style={styles.cellPrice}>{priceExclVat}</Text>
      <Text style={[styles.cellPortion, {color: primaryColor}]}>
        {portion}%
      </Text>
      <Text style={[styles.cellAmount, {color: primaryColor}]}>{amount}</Text>
    </View>
  );
};

const PdfPerItemSection = ({
  translate,
  currentCurrency,
  selectedLng,
  invoice,
  previousInvoices,
  primaryColor,
  secondaryColor,
  fontStyles,
  invoiceAmountDetail,
}: PerItemPaymentProps) => {
  const styles = createStyles({secondaryColor});

  return (
    <View wrap={false} style={styles.container}>
      <TableHeader
        translate={translate}
        currency={currentCurrency}
        styles={styles}
      />

      {previousInvoices?.map((inv) => (
        <View key={inv.id} style={{marginBottom: 8}}>
          {inv.additionalInfo.payment?.description && (
            <View style={styles.descriptionContainer}>
              <HtmlPDF
                html={inv.additionalInfo.payment.description}
                fontStyles={fontStyles}
              />
            </View>
          )}

          {inv?.items?.map((item, idx) => (
            <ItemRow
              key={`${inv.id}-${item.id}`}
              item={item}
              index={idx}
              currency={currentCurrency}
              selectedLng={selectedLng}
              primaryColor={primaryColor}
              fontStyles={fontStyles}
              styles={styles}
              isPreviousInvoices
            />
          ))}
        </View>
      ))}

      {invoice?.additionalInfo.payment?.description && (
        <View style={styles.subjectDivider}>
          <View style={styles.subjectContainer}>
            <HtmlPDF
              html={invoice.additionalInfo.payment.description}
              fontStyles={fontStyles}
            />
          </View>

          {invoice.items?.map((item, idx) => (
            <ItemRow
              key={item.id}
              item={item}
              paymentDetail={invoiceAmountDetail?.items?.[idx].payment}
              index={idx}
              currency={currentCurrency}
              selectedLng={selectedLng}
              primaryColor={primaryColor}
              fontStyles={fontStyles}
              styles={styles}
              isPreviousInvoices={false}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default PdfPerItemSection;
