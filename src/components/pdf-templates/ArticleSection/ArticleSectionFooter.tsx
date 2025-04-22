import {View, Text} from '@react-pdf/renderer';
import {VatAmount} from 'models/invoice';
import {ContextProps} from 'context/PdfStylesProvider';
import {centsToMoney, formatCurrency} from 'utils/currency';
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

  return (
    <View style={styles.container}>
      {discountValue && (
        <View style={styles.footerRow}>
          <Text style={styles.emptyColumn} />
          <Text style={[styles.label, {color: primaryColor}]}>
            {translate('Discount')}({currentCurrency?.symbol})
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
        <View style={styles.footerRow}>
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
        <Text style={[styles.label, {color: primaryColor}]}>
          {translate('Total incl. VAT')}({currentCurrency?.symbol})
        </Text>
        <Text style={[styles.value, {color: primaryColor}]}>
          {amountAfterGlobalDiscountWithVATFormatted}
        </Text>
      </View>
    </View>
  );
};

export default ArticleSectionFooter;
