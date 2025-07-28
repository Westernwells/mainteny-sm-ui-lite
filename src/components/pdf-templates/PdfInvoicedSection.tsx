import {StyleSheet, Text, View} from '@react-pdf/renderer';
import {InvoiceType, InvoiceView} from 'models/invoice';
import {Currency} from 'models/misc';
import {centsToMoney, formatCurrency} from 'utils/currency';
import {formatDate, toDate} from 'utils/datetime';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import {getInvoicedSectionColumns} from 'utils/pdfTemplates';

type InvoicedSectionProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  selectedLng?: string;
  previousInvoices: InvoiceView[];
  amount: number;
  currentPercentageVats: {
    percentageVat: number;
    vat: number;
  }[];
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const getStyles = ({primaryColor}: PdfConfigurationStyles) =>
  StyleSheet.create({
    tableHeading: {
      color: primaryColor,
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

export const PdfInvoicedSection = ({
  translate,
  currentCurrency,
  selectedLng,
  previousInvoices,
  amount,
  currentPercentageVats,
  fontStyles,
  primaryColor,
}: InvoicedSectionProps) => {
  const amountFormatted = formatCurrency(amount, {
    currency: currentCurrency?.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    roundingMode: 'floor',
    excludeCurrencySymbol: true,
    currencySymbol: currentCurrency?.symbol,
    companyLang: selectedLng,
  });

  const styles = getStyles({primaryColor});

  const columns = getInvoicedSectionColumns(translate, currentCurrency);

  return (
    <View wrap={false}>
      <View
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'row',
          width: '100%',
          marginTop: 15,
          marginBottom: 10,
        }}>
        {columns.map((column) => (
          <Text
            style={{
              ...styles.tableHeading,
              textAlign: column.align,
              width: column.width,
            }}
            key={column.name}>
            {column.name}
          </Text>
        ))}
      </View>

      <View>
        {previousInvoices?.map((i) => {
          const invoiceTotal = i.totalAmount!;
          const sortedVats = (invoiceTotal.vats || [])
            .slice()
            .sort((a, b) => a.percentageVat - b.percentageVat);

          const description =
            i.type === InvoiceType.CREDIT_NOTE
              ? translate('Credit Note invoice')
              : i.additionalInfo?.payment?.description || '-';

          const fractionDigits = invoiceTotal.fractionDigits ?? 2;
          const amountExclVat = Math.abs(
            centsToMoney(currentCurrency!.code, invoiceTotal.netAmount ?? 0),
          );
          const amountExclVatFormatted = formatCurrency(amountExclVat, {
            currency: currentCurrency!.code,
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
            excludeCurrencySymbol: true,
            currencySymbol: currentCurrency?.symbol,
            companyLang: selectedLng,
          });

          const totalInclVat = Math.abs(
            centsToMoney(currentCurrency!.code, invoiceTotal.grossAmount ?? 0),
          );
          const totalInclVatFormatted = formatCurrency(totalInclVat, {
            currency: currentCurrency!.code,
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
            excludeCurrencySymbol: true,
            currencySymbol: currentCurrency?.symbol,
            companyLang: selectedLng,
          });

          const sign = i.type === InvoiceType.CREDIT_NOTE ? '+' : '-';

          return (
            <View
              key={i.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'row',
                width: '100%',
                alignItems: 'flex-start',
                paddingBottom: 2,
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
                {sign}
                {amountExclVatFormatted}
              </Text>
              <View
                style={{
                  ...styles.tableRow,
                  flexDirection: 'column',
                  width: '7%',
                  textAlign: 'right',
                }}>
                {sortedVats.map((v, idx) => (
                  <Text key={idx}>{v.percentageVat}%</Text>
                ))}
              </View>
              <View
                style={{
                  ...styles.tableRow,
                  width: '12%',
                  textAlign: 'right',
                  flexDirection: 'column',
                }}>
                {sortedVats.map((v, idx) => {
                  const vatAmount = Math.abs(
                    centsToMoney(currentCurrency!.code, v.vat),
                  );
                  const vatAmountFormatted = formatCurrency(vatAmount, {
                    currency: currentCurrency!.code,
                    minimumFractionDigits: fractionDigits,
                    maximumFractionDigits: fractionDigits,
                    excludeCurrencySymbol: true,
                    currencySymbol: currentCurrency?.symbol,
                    companyLang: selectedLng,
                  });
                  return <Text key={idx}>{vatAmountFormatted}</Text>;
                })}
              </View>
              <Text
                style={{
                  ...styles.tableRow,
                  width: '20%',
                  textAlign: 'right',
                }}>
                {sign}
                {totalInclVatFormatted}
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
          <Text style={{width: '30%', ...fontStyles.bold, color: primaryColor}}>
            {`${translate('Invoice amount')} (${currentCurrency?.symbol})`}
          </Text>
          <Text style={{width: '15%', textAlign: 'right'}} />
          <Text
            style={{
              width: '18%',
              textAlign: 'right',
              ...fontStyles.bold,
              color: primaryColor,
            }}>
            {amountFormatted}
          </Text>
          <View
            style={{
              ...fontStyles.bold,
              width: '7%',
              textAlign: 'right',
              alignItems: 'flex-end',
            }}>
            {currentPercentageVats?.map((v, idx) => (
              <Text key={idx}>{v.percentageVat}%</Text>
            ))}
          </View>
          <View
            style={{
              width: '12%',
              textAlign: 'right',
              alignItems: 'flex-end',
            }}>
            {currentPercentageVats?.map((v, idx) => {
              const vatAmountFormatted = formatCurrency(
                centsToMoney(currentCurrency?.code!, v.vat),
                {
                  currency: currentCurrency?.code,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  excludeCurrencySymbol: true,
                  currencySymbol: currentCurrency?.symbol,
                  companyLang: selectedLng,
                },
              );
              return (
                <Text
                  key={idx}
                  style={{
                    ...fontStyles.bold,
                    color: primaryColor,
                  }}>
                  {vatAmountFormatted}
                </Text>
              );
            })}
          </View>
          <Text
            style={{
              width: '20%',
              textAlign: 'right',
              ...fontStyles.bold,
              color: primaryColor,
            }}>
            {formatCurrency(
              amount +
                currentPercentageVats
                  .map((v) => centsToMoney(currentCurrency?.code!, v.vat))
                  .reduce((a, b) => a + b, 0),
              {
                currency: currentCurrency?.code,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
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

export default PdfInvoicedSection;
