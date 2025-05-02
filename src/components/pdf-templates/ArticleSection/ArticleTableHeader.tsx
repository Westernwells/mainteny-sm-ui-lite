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
      paddingVertical: 4,
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
      marginVertical: 4,
      width: '100%',
      display: 'flex',
      flexWrap: 'wrap',
    },
    col2Left: {
      width: '6%',
      wordBreak: 'break-all',
      whiteSpace: 'pre-wrap',
      textAlign: 'left',
      color: secondaryColor,
    },
    col40Left: {
      width: '37%',
      textAlign: 'left',
      color: secondaryColor,
    },
    col10Right: {
      width: '10%',
      textAlign: 'right',
      color: secondaryColor,
    },
    col8Center: {
      width: '8%',
      textAlign: 'center',
      marginLeft: 10,
      color: secondaryColor,
    },
    col15Right: {
      width: '13%',
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

  const priceWidth = showDiscountCol ? styles.col15Right.width : '18%';

  return (
    <View style={styles.tableHead}>
      <View style={styles.tableRow}>
        <View style={[styles.col2Left]}>
          <Text style={[styles.tableHeading]}>#</Text>
        </View>
        <View style={[styles.col40Left]}>
          <Text style={[styles.tableHeading]}>{translate('Name')}</Text>
        </View>
        <View style={[styles.col10Right]}>
          <Text style={[styles.tableHeading]}>{translate('Quantity')}</Text>
        </View>
        <View style={[styles.col8Center]}>
          <Text style={[styles.tableHeading]}>{translate('Unit')}</Text>
        </View>
        <View style={[styles.col15Right, {width: priceWidth}]}>
          <Text style={[styles.tableHeading]}>
            {`${translate('Price')} (${
              getCurrencySymbol[currentCurrency?.code!]
            })`}
          </Text>
        </View>
        {showDiscountCol && (
          <View style={[styles.col10Right]}>
            <Text style={[styles.tableHeading]}>{translate('Discount')}</Text>
          </View>
        )}

        <View style={[styles.col15Right, {width: priceWidth}]}>
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
