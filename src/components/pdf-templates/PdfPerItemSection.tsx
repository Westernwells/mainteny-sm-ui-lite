import {Text, View, Font, StyleSheet} from '@react-pdf/renderer';
import {InvoiceView} from 'models/invoice';
import {formatCurrency, centsToMoney} from 'utils/currency';
import {Currency} from 'models/misc';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';

type PerItemPaymentProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  selectedLng?: string;
  previousInvoices: InvoiceView[];
  invoice: InvoiceView;
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

export const PdfPerItemSection = ({
  translate,
  currentCurrency,
  selectedLng,
  previousInvoices,
  invoice,
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
          {`${translate('Price')} (${currentCurrency?.symbol})`}
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
          {`${translate('Amount')} (${currentCurrency?.symbol})`}
        </Text>
      </View>

      <View>
        {hasPreviousInvoices &&
          previousInvoices &&
          previousInvoices
            ?.find((prevInvoice) => prevInvoice.id === invoice.id)
            ?.items?.map((invoiceItem, index) => {
              const itemTotalPriceExclVat =
                invoiceItem.unitAmount.netAmount /
                10 ** invoiceItem.unitAmount.fractionDigits;

              const itemAmountToBePaid =
                (itemTotalPriceExclVat / 100) *
                (invoiceItem.additionalInfo?.payment?.percentage ?? 0);
              return (
                <View
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    flexDirection: 'row',
                    marginVertical: 4,
                    borderBottomWidth:
                      index === previousInvoices[0]!.items.length - 1 ? 1 : 0,
                    borderBottomColor: '#212121',
                  }}
                  wrap={false}
                  key={invoiceItem.id}>
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
                    {invoiceItem.name}
                  </Text>
                  <Text
                    style={{
                      textAlign: 'right',
                      width: '18%',
                    }}>
                    {formatCurrency(
                      centsToMoney(
                        currentCurrency?.code!,
                        invoiceItem?.unitAmount.netAmount,
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
                    {invoiceItem?.additionalInfo?.payment?.percentage}%
                  </Text>
                  <Text
                    style={{
                      textAlign: 'right',
                      color: '#212121',
                      width: '25%',
                    }}>
                    {formatCurrency(itemAmountToBePaid, {
                      currency: currentCurrency?.code,
                      excludeCurrencySymbol: true,
                      currencySymbol: currentCurrency?.symbol,
                      companyLang: selectedLng,
                    })}
                  </Text>
                </View>
              );
            })}
      </View>
    </View>
  );
};

export default PdfPerItemSection;
