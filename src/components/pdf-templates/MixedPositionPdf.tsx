import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import {Currency} from 'models/misc';
import {ArticleSubAssociationView, MixedPositionRow} from 'models/article';
import {HtmlPDF} from 'components/HtmlPDF';
import {currencyFormatting, getCurrencySymbol} from 'utils/currency';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import PreviewFrame from '../../assets/images/PreviewFrame.jpg';
import PreviewFrameTwo from '../../assets/images/PreviewFrame2.jpg';
import PreviewFrameThree from '../../assets/images/PreviewFrame3.jpg';
import PreviewFrameFour from '../../assets/images/PreviewFrame4.jpg';

const getStyles = ({
  regularFontStyle,
  primaryColor,
  secondaryColor,
}: PdfConfigurationStyles) =>
  StyleSheet.create({
    page: {
      ...regularFontStyle,
      fontSize: 10,
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      paddingBottom: 25,
      color: primaryColor,
      paddingTop: 46,
    },
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
      color: secondaryColor,
      display: 'flex',
      fontSize: 6,
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      fontSize: 10,
    },
    subPositionRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      fontSize: 10,
    },
    descriptionText: {
      width: '86%',
      fontSize: 8,
      color: primaryColor,
      marginVertical: 5,
      letterSpacing: -0.15,
      lineHeight: 1.4,
      textAlign: 'justify',
      paddingLeft: 20,
    },
    previewImage: {
      width: 150,
      marginVertical: 50,
    },
    dataBody: {
      borderBottom: '1px solid #212121',
      paddingBottom: 5,
    },
    topSection: {
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 60,
    },
    col2Left: {
      width: '2%',
      textAlign: 'left',
      marginRight: 10,
      color: primaryColor,
    },
    col40Left: {
      width: '40%',
      textAlign: 'left',
      color: primaryColor,
    },
    col10Right: {
      width: '10%',
      textAlign: 'right',
      color: primaryColor,
    },
    col8Center: {
      width: '8%',
      textAlign: 'center',
      marginLeft: 10,
      color: primaryColor,
    },
    col15Right: {
      width: '15%',
      textAlign: 'right',
      color: primaryColor,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      fontSize: 10,
      marginVertical: 3,
      color: secondaryColor,
    },
  });

type Props = {
  translate: (key: string, options?: {context: string}) => string;
  currentCurrency?: Currency;
  selectedLng?: string;
  mixedPosition: MixedPositionRow | null;
  subPositions: ArticleSubAssociationView[] | null;
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const MixedPositionPdf = ({
  currentCurrency,
  translate,
  selectedLng,
  mixedPosition,
  subPositions,
  fontStyles,
  primaryColor,
  secondaryColor,
}: Props) => {
  const styles = getStyles({
    regularFontStyle: fontStyles.regular,
    primaryColor,
    secondaryColor,
  });

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.topSection}>
          <Image
            source={PreviewFrame}
            style={{paddingLeft: 57, paddingRight: 35}}
          />
          <Image
            source={PreviewFrameTwo}
            style={{
              paddingLeft: 57,
              paddingRight: 35,
              paddingVertical: 35,
            }}
          />
        </View>

        <View
          style={{
            flex: 1,
            marginBottom: 16,
            paddingLeft: 57,
            paddingRight: 35,
          }}>
          <View>
            <View style={styles.table}>
              <View style={styles.tableHead}>
                <View style={styles.tableRow}>
                  <Text style={[styles.col2Left, styles.tableHeading]}>#</Text>
                  <Text style={[styles.col40Left, styles.tableHeading]}>
                    {translate('Article Name')}
                  </Text>
                  <Text style={[styles.col10Right, styles.tableHeading]}>
                    {translate('Quantity')}
                  </Text>
                  <Text style={[styles.col8Center, styles.tableHeading]}>
                    {translate('Unit')}
                  </Text>
                  <Text style={[styles.col15Right, styles.tableHeading]}>
                    {`${translate('Price')} (${
                      getCurrencySymbol[currentCurrency?.code!]
                    })`}
                  </Text>
                  <Text style={[styles.col10Right, styles.tableHeading]}>
                    {translate('Discount')}
                  </Text>
                  <Text style={[styles.col15Right, styles.tableHeading]}>
                    {`${translate('Total')} (${
                      getCurrencySymbol[currentCurrency?.code!]
                    })`}
                  </Text>
                </View>
              </View>

              <View style={styles.dataBody}>
                <View>
                  <View style={styles.tableRow}>
                    <Text style={styles.col2Left}>{1}</Text>
                    <HtmlPDF
                      html={mixedPosition?.data.name || '-'}
                      rootStyle={styles.col40Left}
                      selectedLng={selectedLng}
                    />
                    <Text style={styles.col10Right}>
                      {mixedPosition?.quantity || '0'}
                    </Text>
                    <Text style={styles.col8Center}>
                      {translate(mixedPosition?.data.unit || '-')}
                    </Text>
                    <Text style={styles.col15Right}>
                      {currencyFormatting(
                        mixedPosition?.data.unitSellingAmount?.netAmount || 0,
                        currentCurrency!,
                        selectedLng,
                      )}
                    </Text>
                    <Text style={styles.col10Right}>-</Text>
                    <Text style={styles.col15Right}>
                      {currencyFormatting(
                        mixedPosition?.data.unitSellingAmount?.netAmount || 0,
                        currentCurrency!,
                        selectedLng,
                      )}
                    </Text>
                  </View>
                  {!!mixedPosition?.data.description?.trim() && (
                    <HtmlPDF
                      html={mixedPosition?.data.description || '-'}
                      rootStyle={{
                        ...styles.descriptionText,
                      }}
                      selectedLng={selectedLng}
                    />
                  )}
                </View>

                {subPositions?.map((subPosition, index) => (
                  <View key={index}>
                    <View style={styles.subPositionRow}>
                      <Text style={styles.col2Left}>
                        {`1.${Number(subPosition?.seqNumber ?? 0) + 1}`}
                      </Text>
                      <HtmlPDF
                        html={subPosition.article.name || '-'}
                        rootStyle={styles.col40Left}
                        selectedLng={selectedLng}
                      />
                      <Text style={styles.col10Right}>
                        {subPosition?.quantity || '0'}
                      </Text>
                      <Text style={styles.col8Center}>
                        {translate(subPosition?.article.unit || '-')}
                      </Text>
                      <Text style={styles.col15Right}>
                        {currencyFormatting(
                          subPosition.article.unitSellingAmount?.netAmount || 0,
                          currentCurrency!,
                          selectedLng,
                        )}
                      </Text>
                      <Text style={styles.col10Right}>-</Text>
                      <Text style={styles.col15Right}>
                        {currencyFormatting(
                          subPosition.article.unitSellingAmount?.netAmount || 0,
                          currentCurrency!,
                          selectedLng,
                        )}
                      </Text>
                    </View>
                    {!!subPosition?.article.description?.trim() && (
                      <HtmlPDF
                        html={subPosition?.article.description || '-'}
                        rootStyle={{
                          ...styles.descriptionText,
                        }}
                        selectedLng={selectedLng}
                      />
                    )}
                  </View>
                ))}
              </View>

              <View>
                <View style={styles.footerRow}>
                  <Text style={{width: '44%'}} />
                  <Text
                    style={{
                      width: '32%',
                      color: secondaryColor,
                      fontSize: 10,
                      textAlign: 'right',
                    }}>
                    {translate('Subtotal excl. VAT')}:
                  </Text>
                  <Text
                    style={{
                      width: '24%',
                      textAlign: 'right',
                      fontSize: 10,
                    }}>
                    {currencyFormatting(
                      mixedPosition?.data.unitSellingAmount?.netAmount || 0,
                      currentCurrency!,
                      selectedLng,
                    )}
                  </Text>
                </View>

                <View style={styles.footerRow}>
                  <Text style={{width: '44%'}} />
                  <View style={{width: '56%'}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 4,
                      }}>
                      <Text
                        style={{
                          color: secondaryColor,
                          fontSize: 10,
                          textAlign: 'right',
                          width: '57%',
                        }}>
                        {translate('VAT')}{' '}
                        {mixedPosition?.data.unitSellingAmount.percentageVat}%
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          textAlign: 'right',
                          width: '43%',
                        }}>
                        {currencyFormatting(
                          mixedPosition?.data.unitSellingAmount?.vat ?? 0,
                          currentCurrency!,
                          selectedLng,
                        )}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.footerRow}>
                  <Text style={{width: '44%'}} />
                  <Text
                    style={{
                      width: '32%',
                      color: primaryColor,
                      fontSize: 10,
                      textAlign: 'right',
                    }}>
                    {translate('Total incl. VAT')}
                  </Text>
                  <Text
                    style={{
                      width: '24%',
                      textAlign: 'right',
                      fontSize: 10,
                      color: primaryColor,
                    }}>
                    {currencyFormatting(
                      mixedPosition?.data.unitSellingAmount?.grossAmount || 0,
                      currentCurrency!,
                      selectedLng,
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View>
          <Image
            source={PreviewFrameThree}
            style={{paddingLeft: 57, paddingRight: 35, paddingVertical: 30}}
          />
          <Image
            source={PreviewFrameFour}
            style={{
              paddingLeft: 57,
              paddingRight: 35,
              height: 45,
              width: 387,
            }}
          />
        </View>
      </Page>
    </Document>
  );
};

export default MixedPositionPdf;
