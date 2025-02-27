import {Text, View, Font, StyleSheet} from '@react-pdf/renderer';
import {
  AggregatedInvoiceItem,
  InvoiceView,
  DiscountType,
  InvoiceType,
} from 'models/invoice';
import {formatCurrency, centsToMoney, getCurrencySymbol} from 'utils/currency';
import {Currency} from 'models/misc';
import {applyDiscount} from 'pages/InvoiceDetails/utils';
import {HtmlPDF} from 'components/HtmlPDF';
import MontserratRegular from '../../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';

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

const styles = StyleSheet.create({
  tableHeading: {
    color: '#616161',
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
    color: '#212121',
    width: '15%',
  },
  colAmount: {
    textAlign: 'right',
    color: '#212121',
    width: '25%',
  },
});

type PerItemPaymentProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  selectedLng?: string;
  invoice?: InvoiceView;
  previousInvoices: InvoiceView[];
};

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
  selectedLng?: string,
) => {
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
    <View key={`${item.article?.id}-${index}`} style={styles.row} wrap={false}>
      <Text style={styles.colIndex}>{index + 1}</Text>
      <View style={styles.colName}>
        <HtmlPDF html={item.name || ''} />
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
  selectedLng?: string,
) => {
  const aggregated = aggregateItems(items);
  return items.map((item, index) => {
    const itemId = item.article?.id!;
    const aggregatedItem = aggregated[itemId] || {
      totalAmountToBePaid: 0,
      totalPercentage: 0,
    };
    return renderRow(item, index, aggregatedItem, currentCurrency, selectedLng);
  });
};

const PdfPreviewPerItemSection = ({
  translate,
  currentCurrency,
  selectedLng,
  invoice,
  previousInvoices,
}: PerItemPaymentProps) => {
  if (!currentCurrency) return null;

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
    return renderRowsFromItems(allItems, currentCurrency, selectedLng);
  };

  return (
    <View wrap={false}>
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
            {renderRowsFromItems(invoice.items, currentCurrency, selectedLng)}
          </View>
        )}
      </View>
    </View>
  );
};

export default PdfPreviewPerItemSection;
