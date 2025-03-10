import {View, Font, Text, StyleSheet} from '@react-pdf/renderer';
import {InvoiceView, InvoiceType} from 'models/invoice';
import {formatCurrency, getCurrencySymbol} from 'utils/currency';
import {formatDate, toDate} from 'utils/datetime';
import {Currency, State} from 'models/misc';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';

type PaymentHistorySectionProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  previousInvoices: InvoiceView[];
  totalAmountInclVatsFormatted: string;
  outstandingAmountFormatted: string;
  selectedLng?: string;
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
    },
    tableRow: {
      display: 'flex',
      flexDirection: 'row',
      fontSize: 10,
      marginVertical: 4,
    },
  });

export const PdfPaymentHistorySection = ({
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

  const styles = getStyles();

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
            if (
              !i.payments?.filter(
                (payment) => payment.meta.state === State.ACTIVE,
              ).length
            ) {
              return null;
            }

            const description =
              i.type === InvoiceType.CREDIT_NOTE
                ? translate('Credit Note invoice')
                : i.additionalInfo?.payment?.description || '';

            const totalPriceInclVat = Math.abs(
              i.payments
                ?.filter((payment) => payment.meta.state === State.ACTIVE)
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
              paddingTop: 8,
            }}>
            <Text style={{width: '60%', textAlign: 'left', ...boldFontStyle}}>
              {`${translate('Outstanding payments')} (${
                getCurrencySymbol[currentCurrency?.code!]
              })`}
            </Text>
            <Text style={{width: '10%', textAlign: 'right'}} />
            <Text style={{width: '40%', textAlign: 'right', ...boldFontStyle}}>
              {outstandingAmountFormatted}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PdfPaymentHistorySection;
