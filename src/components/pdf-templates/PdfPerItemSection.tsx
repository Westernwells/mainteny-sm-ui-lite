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
        <View style={{paddingVertical: 3}}>
          {hasPreviousInvoices &&
            previousInvoices?.map((prevInvoice) => (
              <View key={prevInvoice.id}>
                <Text>
                  {prevInvoice.type === InvoiceType.CREDIT_NOTE
                    ? translate('Credit Note invoice')
                    : prevInvoice.additionalInfo.payment?.description}
                </Text>
              </View>
            ))}
        </View>

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

                  // Calculate base amount from unit price and quantity
                  const baseAmount =
                    (item.unitAmount.netAmount ?? 0) * item.quantity;

                  // Get discount parameters based on discount type
                  const discount = item.additionalInfo?.discount;
                  const discountParams =
                    discount?.type === DiscountType.AMOUNT
                      ? {
                          amount: discount?.amount?.value ?? 0,
                        }
                      : {
                          percentage: discount?.percentage ?? 0,
                        };

                  // Apply discount to get total price excluding VAT
                  const itemTotalPriceExclVat = applyDiscount({
                    actualValue: baseAmount,
                    ...discountParams,
                  });

                  // Calculate amount to be paid based on payment percentage
                  const paymentPercentage =
                    item.additionalInfo?.payment?.percentage ?? 0;
                  const itemAmountToBePaid =
                    (itemTotalPriceExclVat / 100) * paymentPercentage;

                  // Update accumulated totals
                  acc[itemId].totalAmountToBePaid += centsToMoney(
                    item.unitAmount.currency,
                    itemAmountToBePaid,
                  );
                  acc[itemId].totalPercentage += paymentPercentage;
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
                        // Calculate base amount from unit price and quantity
                        const baseAmount =
                          (item.unitAmount.netAmount ?? 0) * item.quantity;

                        // Get discount parameters based on discount type
                        const discount = item.additionalInfo?.discount;
                        const discountParams =
                          discount?.type === DiscountType.AMOUNT
                            ? {
                                amount: discount?.amount?.value ?? 0,
                              }
                            : {
                                percentage: discount?.percentage ?? 0,
                              };

                        // Apply discount and convert to money
                        const discountedAmount = applyDiscount({
                          actualValue: baseAmount,
                          ...discountParams,
                        });

                        const amountInMoney = centsToMoney(
                          currentCurrency?.code!,
                          discountedAmount,
                        );

                        // Format amount with currency
                        const itemTotalPriceExclVat = formatCurrency(
                          amountInMoney,
                          {
                            currency: currentCurrency?.code,
                            excludeCurrencySymbol: true,
                            currencySymbol: currentCurrency?.symbol,
                            companyLang: selectedLng,
                          },
                        );

                        return (
                          <View
                            key={`${prevInvoice.id}-${item.id}`}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              width: '100%',
                              flexDirection: 'row',
                              marginVertical: 4,
                              borderBottomWidth:
                                index === prevInvoice.items.length - 1 ? 1 : 0,
                              borderBottomColor: '#212121',
                              paddingBottom: 3,
                            }}>
                            <Text
                              style={{
                                textAlign: 'left',
                                width: '4%',
                              }}>
                              {index + 1}
                            </Text>
                            <View style={{width: '36%', textAlign: 'left'}}>
                              <HtmlPDF
                                html={item.name || ''}
                                selectedLng={selectedLng}
                              />
                            </View>

                            <Text
                              style={{
                                textAlign: 'right',
                                width: '18%',
                              }}>
                              {itemTotalPriceExclVat}
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
