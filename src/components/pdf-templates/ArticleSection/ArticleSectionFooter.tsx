import {View, Text} from '@react-pdf/renderer';
import {VatAmount} from 'models/invoice';
import {ContextProps} from 'context/PdfStylesProvider';
import {centsToMoney, formatCurrency, getCurrencySymbol} from 'utils/currency';
import {getStyles} from './ArticleSection.styles';

type ArticleSectionFooterProps = {
  translate: (key: string) => string;
  discountValue: number;
  currentCurrency: {code: string; symbol: string} | undefined;
  selectedLng?: string;
  amountAfterGlobalDiscountFormatted: string;
  vats: VatAmount[];
  amountAfterGlobalDiscountWithVATFormatted: string;
  primaryColor: string;
} & Pick<ContextProps, 'fontStyles' | 'primaryColor'>;

const ArticleSectionFooter = ({
  translate,
  discountValue,
  currentCurrency,
  selectedLng,
  amountAfterGlobalDiscountFormatted,
  vats,
  amountAfterGlobalDiscountWithVATFormatted,
  fontStyles,
  primaryColor,
}: ArticleSectionFooterProps) => {
  const styles = getStyles({
    boldFontStyle: fontStyles.bold,
    regularFontStyle: fontStyles.regular,
    primaryColor,
  });
  console.log(currentCurrency?.symbol, 'currnetSymleo');
  return (
    <View style={styles.container}>
      {discountValue && (
        <View style={styles.footerRow}>
          <Text style={styles.emptyColumn} />
          <Text style={[styles.label, {color: primaryColor}]}>
            {translate('Discount')}({getCurrencySymbol[currentCurrency?.code!]})
          </Text>
          <Text style={styles.value}>
            {formatCurrency(discountValue || 0, {
              currency: currentCurrency?.code!,
              excludeCurrencySymbol: true,
              currencySymbol: currentCurrency?.symbol,
              companyLang: selectedLng,
            })}
          </Text>
        </View>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.emptyColumn} />
        <Text style={[styles.label, {color: primaryColor}]}>
          {translate('Subtotal excl. VAT')}
        </Text>
        <Text style={styles.value}>{amountAfterGlobalDiscountFormatted}</Text>
      </View>

      {vats.length > 0 && (
        <View>
          <Text style={styles.emptyColumn} />
          <View style={styles.vatContainer}>
            {vats.map((vat, index) => (
              <View style={styles.vatRow} key={`${vat.vat}-${index}`}>
                <Text style={[styles.vatLabel, {color: primaryColor}]}>
                  {translate('VAT')} {vat.percentageVat}%
                </Text>
                <Text style={styles.vatValue}>
                  {formatCurrency(
                    centsToMoney(currentCurrency?.code!, vat.vat),
                    {
                      currency: currentCurrency?.code!,
                      excludeCurrencySymbol: true,
                      currencySymbol: currentCurrency?.symbol,
                      companyLang: selectedLng,
                    },
                  )}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.emptyColumn} />
        <Text
          style={[styles.label, {color: primaryColor}, styles.totalInclValue]}>
          {translate('Total incl. VAT')}(
          {getCurrencySymbol[currentCurrency?.code!]})
        </Text>
        <Text
          style={[styles.value, {color: primaryColor}, styles.totalInclValue]}>
          {amountAfterGlobalDiscountWithVATFormatted}
        </Text>
      </View>
    </View>
  );
};

export default ArticleSectionFooter;
