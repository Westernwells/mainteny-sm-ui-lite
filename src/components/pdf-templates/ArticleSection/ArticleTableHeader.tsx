import {StyleSheet, Text, View} from '@react-pdf/renderer';
import {ContextProps} from 'context/PdfStylesProvider';
import {Currency} from 'models/misc';
import {PdfConfigurationStyles} from 'models/pdfs';
import {getCurrencySymbol} from 'utils/currency';

const getStyles = ({primaryColor, secondaryColor}: PdfConfigurationStyles) =>
  StyleSheet.create({
    table: {
      width: '100%',
      display: 'flex',
    },
    tableHead: {
      display: 'flex',
      flexDirection: 'row',
      paddingVertical: 2,
    },
    tableHeading: {
      color: primaryColor,
      display: 'flex',
      fontSize: 6,
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      fontSize: 10,
      paddingVertical: 4,
      width: '100%',
      display: 'flex',
      flexWrap: 'wrap',
    },
    col6Left: {
      width: '6%',
      wordBreak: 'break-all',
      whiteSpace: 'pre-wrap',
      textAlign: 'left',
      color: secondaryColor,
    },
    col37Left: {
      width: '37%',
      textAlign: 'left',
      color: secondaryColor,
    },
    col12Right: {
      width: '12%',
      textAlign: 'right',
      color: secondaryColor,
    },
    col8Right: {
      width: '8%',
      textAlign: 'right',
      color: secondaryColor,
      paddingRight: 3,
    },
    col8Center: {
      width: '8%',
      textAlign: 'center',
      paddingLeft: 8,
      color: secondaryColor,
    },
    col12Left: {
      width: '12%',
      textAlign: 'left',
      paddingLeft: 8,
      color: secondaryColor,
    },
    col11Right: {
      width: '11%',
      textAlign: 'right',
      color: secondaryColor,
    },
  });

type Props = {
  translate: (key: string, options?: {context: string}) => string;
  currentCurrency?: Currency;
  showDiscountCol?: boolean;
} & Pick<ContextProps, 'primaryColor' | 'secondaryColor'>;

const ArticleTableHeader = ({
  translate,
  currentCurrency,
  showDiscountCol,
  primaryColor,
  secondaryColor,
}: Props) => {
  const styles = getStyles({
    primaryColor,
    secondaryColor,
  });

  const priceWidth = showDiscountCol ? styles.col12Right.width : '18.5%';

  return (
    <View style={styles.tableHead}>
      <View style={styles.tableRow}>
        <View style={[styles.col6Left]}>
          <Text style={[styles.tableHeading]}>#</Text>
        </View>
        <View style={[styles.col37Left]}>
          <Text style={[styles.tableHeading]}>{translate('Name')}</Text>
        </View>
        <View style={[styles.col8Right]}>
          <Text style={[styles.tableHeading]}>{translate('Quantity')}</Text>
        </View>
        <View style={[styles.col12Left]}>
          <Text style={[styles.tableHeading]}>{translate('Unit')}</Text>
        </View>
        <View style={[styles.col11Right, {width: priceWidth}]}>
          <Text style={[styles.tableHeading]}>
            {`${translate('Price')} (${
              getCurrencySymbol[currentCurrency?.code!]
            })`}
          </Text>
        </View>
        {showDiscountCol && (
          <View style={[styles.col12Right]}>
            <Text style={[styles.tableHeading]}>{translate('Discount')}</Text>
          </View>
        )}

        <View style={[styles.col12Right, {width: priceWidth}]}>
          <Text style={[styles.tableHeading]}>
            {`${translate('Total')} (${
              getCurrencySymbol[currentCurrency?.code!]
            })`}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ArticleTableHeader;
