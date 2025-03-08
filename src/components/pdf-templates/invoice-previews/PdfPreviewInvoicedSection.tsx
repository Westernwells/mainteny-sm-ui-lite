import {View, Text, Font, StyleSheet} from '@react-pdf/renderer';
import {InvoiceView, InvoiceType} from 'models/invoice';
import {Currency} from 'models/misc';
import {centsToMoney, formatCurrency} from 'utils/currency';
import {formatDate, toDate} from 'utils/datetime';
import {fixRounding} from 'utils/utils';
import MontserratRegular from '../../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';

type InvoicedSectionProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  selectedLng?: string;
  previousInvoices: InvoiceView[];
  amount: number;
  currentInvoiceAmountPercentageVats: {
    percentageVat: number;
    vat: number;
  }[];
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
    tableRow: {
      display: 'flex',
      flexDirection: 'row',
      fontSize: 10,
      marginVertical: 4,
    },
  });

export const PdfPreviewInvoicedSection = ({
  translate,
  currentCurrency,
  selectedLng,
  previousInvoices,
  amount,
  currentInvoiceAmountPercentageVats,
}: InvoicedSectionProps) => {
  const amountFormatted = formatCurrency(fixRounding(amount, 2), {
    currency: currentCurrency?.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    roundingMode: 'floor',
    excludeCurrencySymbol: true,
    currencySymbol: currentCurrency?.symbol,
    companyLang: selectedLng,
  });

  const invoicedSectionColumns: {
    name: string;
    align: 'left' | 'right' | 'center' | 'justify' | undefined;
    width: string;
  }[] = [
    {name: 'Invoiced', align: 'left', width: '30%'},
    {name: 'Date', align: 'right', width: '15%'},
    {
      name: `Total (${currentCurrency?.symbol})`,
      align: 'right',
      width: '18%',
    },
    {name: 'VAT (%)', align: 'right', width: '7%'},
    {name: 'VAT', align: 'right', width: '12%'},
    {
      name: `Total incl. VAT (${currentCurrency?.symbol})`,
      align: 'right',
      width: '20%',
    },
  ];

  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const styles = getStyles();

  return (
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
        {invoicedSectionColumns.map((column) => (
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
        {previousInvoices.map((i) => {
          const invoiceTotalAmount = i.totalAmount;
          const description =
            i.type === InvoiceType.CREDIT_NOTE
              ? translate('Credit Note invoice')
              : i.additionalInfo?.payment?.description || '';
          const fractionDigits = invoiceTotalAmount?.fractionDigits ?? 2;
          const amountExclVat = Math.abs(
            (invoiceTotalAmount?.netAmount ?? 0) / 10 ** fractionDigits,
          );
          const amountExclVatFormatted = formatCurrency(amountExclVat, {
            currency: currentCurrency?.code,
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
            roundingMode: 'floor',
            excludeCurrencySymbol: true,
            currencySymbol: currentCurrency?.symbol,
            companyLang: selectedLng,
          });

          const totalAmountInclVat = Math.abs(
            (invoiceTotalAmount?.grossAmount ?? 0) / 10 ** fractionDigits,
          );

          const totalAmountInclVatFormatted = formatCurrency(
            totalAmountInclVat,
            {
              currency: currentCurrency?.code,
              minimumFractionDigits: fractionDigits,
              maximumFractionDigits: fractionDigits,
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
              <Text style={{...styles.tableRow, width: '30%'}}>
                {description}
              </Text>
              <Text
                style={{
                  ...styles.tableRow,
                  width: '15%',
                  textAlign: 'right',
                }}>
                {i.sentDate ? formatDate(toDate(i.sentDate)) : '-'}
              </Text>
              <Text
                style={{
                  ...styles.tableRow,
                  width: '18%',
                  textAlign: 'right',
                }}>
                {signBeforeNumber}
                {amountExclVatFormatted}
              </Text>
              <View
                style={{
                  ...styles.tableRow,
                  flexDirection: 'column',
                  width: '7%',
                  textAlign: 'right',
                  display: 'flex',
                }}>
                {invoiceTotalAmount.vats.map((v, idx) => (
                  <Text key={idx} style={{marginBottom: 3}}>
                    {v.percentageVat}%
                  </Text>
                ))}
              </View>
              <View
                style={{
                  ...styles.tableRow,
                  width: '12%',
                  textAlign: 'right',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                {invoiceTotalAmount.vats.map((v, idx) => {
                  const vatAmount = Math.abs(
                    centsToMoney(currentCurrency?.code!, v.vat),
                  );
                  const vatAmountFormatted = formatCurrency(vatAmount, {
                    currency: currentCurrency?.code,
                    minimumFractionDigits: fractionDigits,
                    maximumFractionDigits: fractionDigits,
                    roundingMode: 'floor',
                    excludeCurrencySymbol: true,
                    currencySymbol: currentCurrency?.symbol,
                    companyLang: selectedLng,
                  });
                  return (
                    <Text key={idx} style={{marginBottom: 3}}>
                      -{vatAmountFormatted}
                    </Text>
                  );
                })}
              </View>
              <Text
                style={{
                  ...styles.tableRow,
                  width: '20%',
                  textAlign: 'right',
                }}>
                {signBeforeNumber}
                {totalAmountInclVatFormatted}
              </Text>
            </View>
          );
        })}

        <View
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'row',
            borderTopWidth: 1,
            borderTopColor: '#212121',
            paddingTop: 3,
          }}>
          <Text style={{width: '30%', ...boldFontStyle}}>
            {`${translate('Invoice amount')} (${currentCurrency?.symbol})`}
          </Text>
          <Text style={{width: '15%', textAlign: 'right'}} />
          <Text style={{width: '18%', textAlign: 'right', ...boldFontStyle}}>
            {amountFormatted}
          </Text>
          <View
            style={{
              ...boldFontStyle,
              width: '7%',
              textAlign: 'right',
              alignItems: 'flex-end',
            }}>
            {currentInvoiceAmountPercentageVats.map((v, idx) => (
              <Text key={idx} style={{marginBottom: 3}}>
                {v.percentageVat}%
              </Text>
            ))}
          </View>
          <View
            style={{
              width: '12%',
              textAlign: 'right',
              alignItems: 'flex-end',
            }}>
            {currentInvoiceAmountPercentageVats.map((v, idx) => {
              const vatAmountFormatted = formatCurrency(v.vat, {
                currency: currentCurrency?.code,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                roundingMode: 'floor',
                excludeCurrencySymbol: true,
                currencySymbol: currentCurrency?.symbol,
                companyLang: selectedLng,
              });
              return (
                <Text key={idx} style={{marginBottom: 3, ...boldFontStyle}}>
                  {vatAmountFormatted}
                </Text>
              );
            })}
          </View>
          <Text style={{width: '20%', textAlign: 'right', ...boldFontStyle}}>
            {formatCurrency(
              amount +
                currentInvoiceAmountPercentageVats
                  .map((v) => v.vat)
                  .reduce((a, b) => a + b, 0),
              {
                currency: currentCurrency?.code,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                roundingMode: 'floor',
                excludeCurrencySymbol: true,
                currencySymbol: currentCurrency?.symbol,
                companyLang: selectedLng,
              },
            )}
          </Text>
        </View>
      </View>
      <View
        style={{
          display: 'flex',
          marginTop: 2,
          justifyContent: 'flex-end',
          width: '100%',
          flexDirection: 'row',
        }}>
        <View
          style={{
            borderBottomWidth: 2,
            borderBottomColor: '#212121',
            width: '17%',
          }}
        />
      </View>
    </View>
  );
};

export default PdfPreviewInvoicedSection;
