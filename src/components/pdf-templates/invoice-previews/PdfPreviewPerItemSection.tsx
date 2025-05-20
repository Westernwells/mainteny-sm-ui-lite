import {StyleSheet, Text, View} from '@react-pdf/renderer';
import {
  AggregatedInvoiceItem,
  DiscountType,
  InvoiceType,
  InvoiceView,
} from 'models/invoice';
import {centsToMoney, formatCurrency, getCurrencySymbol} from 'utils/currency';
import {Currency} from 'models/misc';
import {applyDiscount} from 'pages/InvoiceDetails/utils';
import {HtmlPDF} from 'components/HtmlPDF';
import {PdfConfigurationStyles} from 'models/pdfs';
import {ContextProps, FontStyle} from 'context/PdfStylesProvider';

const getStyles = ({primaryColor, secondaryColor}: PdfConfigurationStyles) =>
  StyleSheet.create({
    tableHeading: {
      color: secondaryColor,
      fontSize: 6,
      textTransform: 'uppercase',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginTop: 20,
      paddingBottom: 3,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      width: '100%',
      marginVertical: 4,
      paddingBottom: 3,
    },
    colIndex: {
      textAlign: 'left',
      width: '4%',
    },
    colName: {
      width: '36%',
      textAlign: 'left',
    },
    colPrice: {
      textAlign: 'right',
      width: '18%',
    },
    colPortion: {
      textAlign: 'right',
      color: primaryColor,
      width: '15%',
    },
    colAmount: {
      textAlign: 'right',
      color: primaryColor,
      width: '25%',
    },
  });

type PerItemPaymentProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  selectedLng?: string;
  invoice?: InvoiceView;
  previousInvoices: InvoiceView[];
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const aggregateItems = (items: InvoiceView['items']) =>
  items.reduce<Record<string, AggregatedInvoiceItem>>((acc, item) => {
    const paymentPercentage = item.additionalInfo?.payment?.percentage ?? 0;
    if (paymentPercentage > 0) {
      const itemId = item.article?.id!;
      if (!acc[itemId]) {
        acc[itemId] = {
          ...item,
          totalAmountToBePaid: 0,
          totalPercentage: 0,
        };
      }
      const baseAmount = (item.unitAmount.netAmount ?? 0) * item.quantity;
      const discount = item.additionalInfo?.discount;
      const discountParams =
        discount?.type === DiscountType.AMOUNT
          ? {amount: discount?.amount?.value ?? 0}
          : {percentage: discount?.percentage ?? 0};
      const itemTotalPriceExclVat = applyDiscount({
        actualValue: baseAmount,
        ...discountParams,
      });
      const itemAmountToBePaid =
        (itemTotalPriceExclVat / 100) * paymentPercentage;
      acc[itemId].totalAmountToBePaid += centsToMoney(
        item.unitAmount.currency,
        itemAmountToBePaid,
      );
      acc[itemId].totalPercentage += paymentPercentage;
    }
    return acc;
  }, {});

const renderRow = (
  item: InvoiceView['items'][number],
  index: number,
  aggregatedItem: AggregatedInvoiceItem,
  currentCurrency: Currency,
  primaryColor: string,
  secondaryColor: string,
  fontStyles: FontStyle,
  selectedLng?: string,
) => {
  const styles = getStyles({primaryColor, secondaryColor});

  const baseAmount = (item.unitAmount.netAmount ?? 0) * item.quantity;
  const discount = item.additionalInfo?.discount;
  const discountParams =
    discount?.type === DiscountType.AMOUNT
      ? {amount: discount?.amount?.value ?? 0}
      : {percentage: discount?.percentage ?? 0};
  const discountedAmount = applyDiscount({
    actualValue: baseAmount,
    ...discountParams,
  });
  const amountInMoney = centsToMoney(currentCurrency.code, discountedAmount);
  const itemTotalPriceExclVat = formatCurrency(amountInMoney, {
    currency: currentCurrency.code,
    excludeCurrencySymbol: true,
    currencySymbol: currentCurrency.symbol,
    companyLang: selectedLng,
  });
  return (
    <View key={`${item.article?.id}-${index}`} style={styles.row}>
      <Text style={styles.colIndex}>{index + 1}</Text>
      <View style={styles.colName}>
        <HtmlPDF html={item.name || ''} fontStyles={fontStyles} />
      </View>
      <Text style={styles.colPrice}>{itemTotalPriceExclVat}</Text>
      <Text style={styles.colPortion}>{aggregatedItem.totalPercentage}%</Text>
      <Text style={styles.colAmount}>
        {formatCurrency(aggregatedItem.totalAmountToBePaid, {
          currency: currentCurrency.code,
          excludeCurrencySymbol: true,
          currencySymbol: currentCurrency.symbol,
          companyLang: selectedLng,
        })}
      </Text>
    </View>
  );
};

const renderRowsFromItems = (
  items: InvoiceView['items'],
  currentCurrency: Currency,
  primaryColor: string,
  secondaryColor: string,
  fontStyles: FontStyle,
  selectedLng?: string,
) => {
  const aggregated = aggregateItems(items);
  return items.map((item, index) => {
    const itemId = item.article?.id!;
    const aggregatedItem = aggregated[itemId] || {
      totalAmountToBePaid: 0,
      totalPercentage: 0,
    };
    return renderRow(
      item,
      index,
      aggregatedItem,
      currentCurrency,
      primaryColor,
      secondaryColor,
      fontStyles,
      selectedLng,
    );
  });
};

const PdfPreviewPerItemSection = ({
  translate,
  currentCurrency,
  selectedLng,
  invoice,
  previousInvoices,
  primaryColor,
  secondaryColor,
  fontStyles,
}: PerItemPaymentProps) => {
  if (!currentCurrency) return null;

  const styles = getStyles({primaryColor, secondaryColor});

  const renderTableHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.tableHeading, {textAlign: 'left', width: '4%'}]}>
        #
      </Text>
      <Text style={[styles.tableHeading, {textAlign: 'left', width: '36%'}]}>
        {translate('Article name')}
      </Text>
      <Text style={[styles.tableHeading, {textAlign: 'right', width: '18%'}]}>
        {`${translate('Price')} (${getCurrencySymbol[currentCurrency.code]})`}
      </Text>
      <Text style={[styles.tableHeading, {textAlign: 'right', width: '15%'}]}>
        {translate('Portion')} %
      </Text>
      <Text style={[styles.tableHeading, {textAlign: 'right', width: '25%'}]}>
        {`${translate('Amount')} (${getCurrencySymbol[currentCurrency.code]})`}
      </Text>
    </View>
  );

  const renderRowsFromPreviousInvoices = () => {
    const allItems = previousInvoices.flatMap(
      (prevInvoice) => prevInvoice.items,
    );
    return renderRowsFromItems(
      allItems,
      currentCurrency,
      primaryColor,
      secondaryColor,
      fontStyles,
      selectedLng,
    );
  };

  return (
    <View>
      {renderTableHeader()}

      <View>
        <View style={{paddingVertical: 3}}>
          {previousInvoices.length > 0 &&
            previousInvoices.map((prevInvoice) => (
              <View key={prevInvoice.id}>
                <Text>
                  {prevInvoice.type === InvoiceType.CREDIT_NOTE
                    ? translate('Credit Note invoice')
                    : prevInvoice.additionalInfo.payment?.description}
                </Text>
              </View>
            ))}
        </View>
        {previousInvoices.length > 0 && (
          <View>{renderRowsFromPreviousInvoices()}</View>
        )}
      </View>

      <View>
        <View style={{paddingVertical: 3}}>
          <View>
            <Text>
              {invoice?.type === InvoiceType.CREDIT_NOTE
                ? translate('Credit Note invoice')
                : invoice?.additionalInfo.payment?.description}
            </Text>
          </View>
        </View>
        {invoice?.items && (
          <View>
            {renderRowsFromItems(
              invoice.items,
              currentCurrency,
              primaryColor,
              secondaryColor,
              fontStyles,
              selectedLng,
            )}
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#212121',
                marginTop: 4,
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default PdfPreviewPerItemSection;
