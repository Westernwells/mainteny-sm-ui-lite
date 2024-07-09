import {Text, View, Font, StyleSheet} from '@react-pdf/renderer';
import {AggregatedInvoiceItem, InvoiceView} from 'models/invoice';
import {formatCurrency, centsToMoney, getCurrencySymbol} from 'utils/currency';
import {Currency} from 'models/misc';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';

type PerItemPaymentProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  selectedLng?: string;
  invoice?: InvoiceView;
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

const getStyles = () =>
  StyleSheet.create({
    tableHeading: {
      color: '#616161',
      display: 'flex',
      fontSize: 6,
      textTransform: 'uppercase',
    },
  });

const PdfPerItemSection = ({
  translate,
  currentCurrency,
  selectedLng,
  invoice,
  previousInvoices,
}: PerItemPaymentProps) => {
  const styles = getStyles();

  const hasPreviousInvoices = previousInvoices.length > 0;

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
          paddingBottom: 3,
        }}>
        <Text
          style={{
            ...styles.tableHeading,
            textAlign: 'left',
            width: '4%',
          }}>
          #
        </Text>
        <Text
          style={{
            ...styles.tableHeading,
            textAlign: 'left',
            width: '36%',
          }}>
          {translate('Article name')}
        </Text>
        <Text
          style={{
            ...styles.tableHeading,
            textAlign: 'right',
            width: '18%',
          }}>
          {`${translate('Price')} (${
            getCurrencySymbol[currentCurrency?.code!]
          })`}
        </Text>
        <Text
          style={{
            ...styles.tableHeading,
            textAlign: 'right',
            width: '15%',
          }}>
          {translate('Portion')} %
        </Text>
        <Text
          style={{
            ...styles.tableHeading,
            textAlign: 'right',
            width: '25%',
          }}>
          {`${translate('Amount')} (${
            getCurrencySymbol[currentCurrency?.code!]
          })`}
        </Text>
      </View>

      <View>
        {hasPreviousInvoices &&
          previousInvoices &&
          (() => {
            const aggregatedItems = previousInvoices.reduce<
              Record<string, AggregatedInvoiceItem>
            >((acc, prevInvoice) => {
              prevInvoice.items.forEach((item) => {
                if (
                  item.additionalInfo?.payment?.percentage &&
                  item.additionalInfo?.payment?.percentage > 0
                ) {
                  const itemId = item.article?.id!;
                  if (!acc[itemId]) {
                    acc[itemId] = {
                      ...item,
                      totalAmountToBePaid: 0,
                      totalPercentage: 0,
                    };
                  }

                  const itemTotalPriceExclVat =
                    (item.unitAmount.netAmount * item.quantity) /
                    10 ** item.unitAmount.fractionDigits;

                  const itemAmountToBePaid =
                    (itemTotalPriceExclVat / 100) *
                    (item.additionalInfo?.payment?.percentage ?? 0);

                  acc[itemId].totalAmountToBePaid += itemAmountToBePaid;
                  acc[itemId].totalPercentage +=
                    item.additionalInfo?.payment?.percentage ?? 0;
                }
              });
              return acc;
            }, {});

            const currentInvoiceItems = previousInvoices.flatMap(
              (prevInvoice) =>
                prevInvoice.id === invoice?.id
                  ? prevInvoice.items
                      .filter(
                        (item) =>
                          (item.additionalInfo?.payment?.percentage ?? 0) > 0,
                      )
                      .map((item, index) => {
                        const itemId = item.article?.id!;
                        const aggregatedItem = aggregatedItems[itemId];

                        return (
                          <View
                            key={`${prevInvoice.id}-${item.id}`}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              width: '100%',
                              flexDirection: 'row',
                              marginVertical: 4,
                              borderBottomWidth:
                                index === prevInvoice.items.length - 1 ? 1 : 0,
                              borderBottomColor: '#212121',
                              paddingBottom: 3,
                            }}
                            wrap={false}>
                            <Text
                              style={{
                                textAlign: 'left',
                                width: '4%',
                              }}>
                              {index + 1}
                            </Text>
                            <Text
                              style={{
                                textAlign: 'left',
                                width: '36%',
                              }}>
                              {item.name}
                            </Text>
                            <Text
                              style={{
                                textAlign: 'right',
                                width: '18%',
                              }}>
                              {formatCurrency(
                                centsToMoney(
                                  currentCurrency?.code!,
                                  item.unitAmount.netAmount * item.quantity,
                                ),
                                {
                                  currency: currentCurrency?.code,
                                  excludeCurrencySymbol: true,
                                  currencySymbol: currentCurrency?.symbol,
                                  companyLang: selectedLng,
                                },
                              )}
                            </Text>
                            <Text
                              style={{
                                textAlign: 'right',
                                color: '#212121',
                                width: '15%',
                              }}>
                              {aggregatedItem.totalPercentage}%
                            </Text>
                            <Text
                              style={{
                                textAlign: 'right',
                                color: '#212121',
                                width: '25%',
                              }}>
                              {formatCurrency(
                                aggregatedItem.totalAmountToBePaid,
                                {
                                  currency: currentCurrency?.code,
                                  excludeCurrencySymbol: true,
                                  currencySymbol: currentCurrency?.symbol,
                                  companyLang: selectedLng,
                                },
                              )}
                            </Text>
                          </View>
                        );
                      })
                  : [],
            );

            return <View>{currentInvoiceItems}</View>;
          })()}
      </View>
    </View>
  );
};

export default PdfPerItemSection;
