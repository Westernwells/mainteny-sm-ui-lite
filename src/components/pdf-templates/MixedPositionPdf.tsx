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
import {currencyFormatting} from 'utils/currency';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import PreviewFrame from '../../assets/images/PreviewFrame.jpg';
import PreviewFrameTwo from '../../assets/images/PreviewFrame2.jpg';
import PreviewFrameThree from '../../assets/images/PreviewFrame3.jpg';
import PreviewFrameFour from '../../assets/images/PreviewFrame4.jpg';
import ArticleTableHeader from './ArticleSection/ArticleTableHeader';

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
    tableRow: {
      flexDirection: 'row',
      fontSize: 10,
      marginVertical: 4,
      width: '100%',
      display: 'flex',
      flexWrap: 'wrap',
    },
    subPositionRow: {
      flexDirection: 'row',
      fontSize: 10,
      marginVertical: 4,
      width: '100%',
      display: 'flex',
      flexWrap: 'wrap',
    },
    descriptionText: {
      width: '85%',
      fontSize: 8,
      color: primaryColor,
      paddingLeft: 30,
      paddingRight: 5,
      marginVertical: 2,
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
      width: '6%',
      wordBreak: 'break-all',
      whiteSpace: 'pre-wrap',
      textAlign: 'left',
      color: primaryColor,
    },
    col40Left: {
      width: '37%',
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
      width: '13%',
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
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
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
          <View style={styles.table}>
            <ArticleTableHeader
              translate={translate}
              currentCurrency={currentCurrency}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />

            <View style={styles.dataBody}>
              <View>
                <View style={styles.tableRow}>
                  <View style={styles.col2Left}>
                    <Text>{1}</Text>
                  </View>
                  <View style={styles.col40Left}>
                    <Text>{mixedPosition?.data.name || '-'}</Text>
                  </View>

                  <View style={styles.col10Right}>
                    <Text>{mixedPosition?.quantity || '0'}</Text>
                  </View>

                  <View style={styles.col8Center}>
                    <Text>{translate(mixedPosition?.data.unit || '-')}</Text>
                  </View>

                  <View style={styles.col15Right}>
                    <Text>
                      {currencyFormatting(
                        mixedPosition?.data.unitSellingAmount?.netAmount || 0,
                        currentCurrency!,
                        selectedLng,
                      )}
                    </Text>
                  </View>

                  <View style={styles.col10Right}>
                    <Text>-</Text>
                  </View>

                  <View style={styles.col15Right}>
                    <Text>
                      {currencyFormatting(
                        mixedPosition?.data.unitSellingAmount?.netAmount || 0,
                        currentCurrency!,
                        selectedLng,
                      )}
                    </Text>
                  </View>
                </View>

                <View>
                  {!!mixedPosition?.data.description?.trim() && (
                    <HtmlPDF
                      html={mixedPosition?.data.description || '-'}
                      rootStyle={{
                        ...styles.descriptionText,
                      }}
                      fontStyles={fontStyles}
                    />
                  )}
                </View>
              </View>

              {subPositions?.map((subPosition, index) => (
                <View key={index}>
                  <View style={styles.subPositionRow}>
                    <View style={styles.col2Left}>
                      <Text>
                        {`1.${Number(subPosition?.seqNumber ?? 0) + 1}`}
                      </Text>
                    </View>
                    <View style={styles.col40Left}>
                      <Text>{subPosition.article.name || '-'}</Text>
                    </View>

                    <View style={styles.col10Right}>
                      <Text> {subPosition?.quantity || '0'}</Text>
                    </View>

                    <View style={styles.col8Center}>
                      <Text>
                        {' '}
                        {translate(subPosition?.article.unit || '-')}
                      </Text>
                    </View>

                    <View style={styles.col15Right}>
                      <Text>
                        {currencyFormatting(
                          subPosition.article.unitSellingAmount?.netAmount || 0,
                          currentCurrency!,
                          selectedLng,
                        )}
                      </Text>
                    </View>

                    <View style={styles.col10Right}>
                      <Text>-</Text>
                    </View>

                    <View style={styles.col15Right}>
                      <Text>
                        {currencyFormatting(
                          (subPosition.article.unitSellingAmount?.netAmount ??
                            0) * (subPosition?.quantity ?? 0) || 0,
                          currentCurrency!,
                          selectedLng,
                        )}
                      </Text>
                    </View>
                  </View>

                  {!!subPosition?.article.description?.trim() && (
                    <View>
                      <HtmlPDF
                        html={subPosition?.article.description || '-'}
                        rootStyle={{
                          ...styles.descriptionText,
                        }}
                        fontStyles={fontStyles}
                      />
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.container}>
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
                    paddingRight: 5,
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
                        paddingRight: 5,
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
                    paddingRight: 5,
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
