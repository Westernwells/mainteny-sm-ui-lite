import {Text, View} from '@react-pdf/renderer';
import {
  centsToMoney,
  formatCurrency,
  getCurrencySymbol,
} from '../../../utils/currency';
import {HtmlPDF} from '../../HtmlPDF';
import {DiscountType, InvoiceItem, InvoiceView} from '../../../models/invoice';
import {fixRounding} from '../../../utils/utils';
import {Currency} from '../../../models/misc';
import {getStyles} from './ArticleSection.styles';
import TableHeading from '../TableHeading/TableHeading';

type Props = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  invoice: InvoiceView;
  allItemsHaveZeroDiscount: boolean;
  discountValue: number;
  subtotalExclVatFormatted: string;
  percentageVats: {
    percentageVat: number;
    vat: number;
  }[];
  total: number;
  selectedLng?: string;
  netTotal: (articleItem: InvoiceItem) => number;
};

export const ArticleSection = ({
  invoice,
  currentCurrency,
  translate,
  allItemsHaveZeroDiscount,
  discountValue,
  subtotalExclVatFormatted,
  percentageVats,
  total,
  selectedLng,
  netTotal,
}: Props) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const styles = getStyles();
  return (
    <View style={styles.table}>
      <View style={styles.tableHead}>
        <View style={{...styles.tableRow, width: '100%'}}>
          <TableHeading text="#" width="2%" textAlign="left" />
          <TableHeading
            text={translate('Article Name')}
            width="37%"
            textAlign="left"
            marginLeft={10}
          />
          <TableHeading
            text={translate('Quantity')}
            width="10%"
            textAlign="center"
          />
          <TableHeading
            text={translate('Unit')}
            width="8%"
            textAlign="center"
          />
          <TableHeading
            text={`${translate('Price')} (${
              getCurrencySymbol[currentCurrency?.code!]
            })`}
            width="15%"
            textAlign="right"
            marginLeft={5}
          />
          {!allItemsHaveZeroDiscount && (
            <TableHeading
              text={translate('Discount')}
              width="13%"
              textAlign="right"
            />
          )}
          <TableHeading
            text={`${translate('Total')} (${
              getCurrencySymbol[currentCurrency?.code!]
            })`}
            width={allItemsHaveZeroDiscount ? '28%' : '15%'}
            textAlign="right"
          />
        </View>
      </View>

      {invoice.items.length > 0 && (
        <View style={styles.dataBody}>
          {invoice.items?.map((articleItem, index) => (
            <View key={`${articleItem.id} - ${index}`}>
              <View style={styles.tableRow}>
                <Text
                  style={{
                    width: '2%',
                    textAlign: 'left',
                    marginRight: 10,
                    color: '#212121',
                  }}>
                  {index + 1}
                </Text>

                <HtmlPDF
                  rootStyle={{
                    width: '37%',
                    textAlign: 'left',
                    alignItems: 'flex-start',
                    color: '#212121',
                  }}
                  html={articleItem.name || '-'}
                />

                <Text
                  style={{
                    width: '10%',
                    textAlign: 'center',
                    color: '#212121',
                  }}>
                  {articleItem.quantity || '-'}
                </Text>
                <Text
                  style={{
                    width: '8%',
                    textAlign: 'center',
                    color: '#212121',
                  }}>
                  {translate(articleItem?.article?.unit!) || '-'}
                </Text>
                <Text
                  style={{
                    width: '15%',
                    textAlign: 'right',
                    color: '#212121',
                  }}>
                  {formatCurrency(
                    centsToMoney(
                      currentCurrency?.code!,
                      articleItem?.unitAmount?.netAmount,
                    ) ?? 0,
                    {
                      currency: currentCurrency?.code,
                      excludeCurrencySymbol: true,
                      currencySymbol: currentCurrency?.symbol,
                      companyLang: selectedLng,
                    },
                  )}
                </Text>
                {!allItemsHaveZeroDiscount && (
                  <Text
                    style={{
                      width: '13%',
                      textAlign: 'right',
                      color: '#212121',
                    }}>
                    {articleItem?.additionalInfo?.discount?.percentage !== 0 ||
                    articleItem?.additionalInfo?.discount?.amount?.value !== 0
                      ? '-'
                      : ''}
                    {articleItem?.additionalInfo?.discount?.type ===
                    DiscountType.PERCENTAGE
                      ? articleItem?.additionalInfo?.discount.percentage
                      : formatCurrency(
                          centsToMoney(
                            currentCurrency?.code!,
                            articleItem?.additionalInfo?.discount?.amount
                              ?.value,
                          ),
                          {
                            currency: currentCurrency?.code,
                            excludeCurrencySymbol: true,
                            currencySymbol: currentCurrency?.symbol,
                            companyLang: selectedLng,
                            minimumFractionDigits:
                              articleItem?.additionalInfo?.discount?.amount
                                ?.value === 0
                                ? 0
                                : 2,
                            maximumFractionDigits:
                              articleItem?.additionalInfo?.discount?.amount
                                ?.value === 0
                                ? 0
                                : 2,
                          },
                        )}
                    {articleItem?.additionalInfo?.discount?.type ===
                    DiscountType.AMOUNT
                      ? getCurrencySymbol[currentCurrency?.code!]
                      : '%'}
                  </Text>
                )}
                <Text
                  style={{
                    width: allItemsHaveZeroDiscount ? '28%' : '15%',
                    textAlign: 'right',
                    color: '#212121',
                  }}>
                  {formatCurrency(netTotal(articleItem), {
                    currency: currentCurrency?.code,
                    excludeCurrencySymbol: true,
                    currencySymbol: currentCurrency?.symbol,
                    companyLang: selectedLng,
                  })}
                </Text>
              </View>
              {articleItem?.description.trim() && (
                <HtmlPDF
                  rootStyle={styles.descriptionText}
                  html={articleItem.description || '-'}
                />
              )}
            </View>
          ))}
        </View>
      )}

      <View wrap={false}>
        {discountValue && (
          <View style={styles.tableRow}>
            <Text style={{width: '44%'}} />
            <Text
              style={{
                width: '32%',
                color: '#616161',
                fontSize: 10,
                textAlign: 'right',
              }}>{`${translate('Discount')} (${
              getCurrencySymbol[currentCurrency?.code!]
            })`}</Text>
            <Text style={{width: '24%', textAlign: 'right', fontSize: 10}}>
              {discountValue > 0 ? '-' : ''}
              {formatCurrency(discountValue, {
                currency: currentCurrency?.code,
                excludeCurrencySymbol: true,
                currencySymbol: currentCurrency?.symbol,
                companyLang: selectedLng,
              })}
            </Text>
          </View>
        )}
        <View style={styles.tableRow}>
          <Text style={{width: '44%'}} />
          <Text
            style={{
              width: '32%',
              color: '#616161',
              fontSize: 10,
              textAlign: 'right',
            }}>
            {translate('Subtotal excl. VAT')}
          </Text>
          <Text style={{width: '24%', textAlign: 'right', fontSize: 10}}>
            {subtotalExclVatFormatted}
          </Text>
        </View>
        <View>
          {percentageVats.map((v, index) => (
            <View style={styles.tableRow} key={`${index}-${v.percentageVat}`}>
              <Text style={{width: '44%'}} />
              <Text
                style={{
                  width: '32%',
                  color: '#616161',
                  fontSize: 10,
                  textAlign: 'right',
                }}>{`${translate('VAT')} ${v.percentageVat}%`}</Text>
              <Text style={{width: '24%', textAlign: 'right', fontSize: 10}}>
                {formatCurrency(fixRounding(v.vat, 2), {
                  currency: currentCurrency?.code,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  roundingMode: 'floor',
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
              color: '#212121',
              ...boldFontStyle,
              textAlign: 'right',
              fontSize: 10,
            }}>{`${translate('Total incl. VAT')} (${
            getCurrencySymbol[currentCurrency?.code!]
          })`}</Text>
          <Text
            style={{
              width: '24%',
              textAlign: 'right',
              color: '#212121',
              ...boldFontStyle,
              fontSize: 10,
            }}>
            {formatCurrency(total, {
              currency: currentCurrency?.code,
              excludeCurrencySymbol: true,
              currencySymbol: currentCurrency?.symbol,
              companyLang: selectedLng,
            })}
          </Text>
        </View>
      </View>
    </View>
  );
};
