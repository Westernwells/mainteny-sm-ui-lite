import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import {ArticleOrderView} from 'models/article';
import {UserAccount} from 'models/user';
import React from 'react';
import {formatCurrency} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import {
  calculateTotal,
  calculateTotalVAT,
  convertToArticleOrderItemRecord,
} from './utils';

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

const getStyles = (
  boldFontStyle?: {fontFamily: string},
  regularFontStyle?: {fontFamily: string},
) =>
  StyleSheet.create({
    page: {
      ...regularFontStyle,
      fontSize: 10,
      paddingTop: 25,
      paddingLeft: 68,
      paddingRight: 45,
      backgroundColor: 'white',
      height: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      justifyContent: 'space-between',
      paddingBottom: 95,
      color: '#212121',
    },
    topSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 40,
      alignItems: 'flex-start',
      position: 'absolute',
      top: 90,
    },
    leftAddress: {
      flex: '0 0 55%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      ...boldFontStyle,
    },
    addressText: {
      fontSize: 8,
      marginBottom: 23,
      ...regularFontStyle,
    },
    partialAddressText: {
      fontSize: 10,
      marginBottom: 1,
      ...boldFontStyle,
    },
    partAddress: {
      fontSize: 10,
      marginBottom: 4,
    },
    rightAddress: {
      minWidth: 200,
      flex: '0 0 45%',
      display: 'flex',
      flexDirection: 'column',
    },
    rightAddressContent: {
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 6,
      ...boldFontStyle,
    },
    tag: {
      ...boldFontStyle,
      fontSize: 10,
      color: '#212121',
      flex: '0 0 43%',
    },
    tagContent: {
      fontSize: 10,
      color: '#616161',
      flex: '0 0 55%',
      textAlign: 'right',
      ...regularFontStyle,
    },
    dataBody: {
      borderBottom: '1px solid #212121',
      paddingBottom: 1,
    },
    contentHeader: {
      fontSize: 14,
      color: '#212121',
      marginTop: 110,
      marginBottom: 10,
      ...boldFontStyle,
    },
    contentBody: {
      color: '#616161',
      fontSize: 10,
      marginBottom: 10,
      lineHeight: 1.3,
      maxWidth: '100%',
    },
    notesSection: {
      paddingBottom: 6,
      marginTop: 5,
    },
    deliverySection: {
      paddingBottom: 6,
      marginTop: 10,
    },
    sectionHeading: {
      fontSize: 10,
      padding: 0,
      lineHeight: 0,
      marginBottom: 6,
      color: '#212121',
      fontWeight: 'extrabold',
    },
    sectionBody: {
      fontSize: 10,
      fontWeight: 'light',
      color: '#616161',
      display: 'flex',
      flexDirection: 'column',
      paddingVertical: 1.5,
    },
    table: {
      width: '100%',
      display: 'flex',
      marginTop: 10,
    },
    tableHead: {
      display: 'flex',
      flexDirection: 'row',
      paddingVertical: 4,
    },
    tableHeading: {
      color: '#8f9bb3',
      display: 'flex',
      fontWeight: 'extrabold',
      fontSize: 6,
    },
    tableRow: {
      display: 'flex',
      flexDirection: 'row',
      fontSize: 10,
      marginVertical: 4,
    },
    descriptionText: {
      width: '45%',
      display: 'flex',
      fontSize: 8.5,
      color: '#212121',
      paddingLeft: 20,
      letterSpacing: -0.15,
      marginTop: 2,
      lineHeight: 1.3,
    },
  });

type Props = {
  translate: (key: string) => string;
  articleOrder?: ArticleOrderView | undefined;
  userInfo?: UserAccount | undefined;
  logoSrc?: string;
  currencyCode?: string;
  logoDimensions?: {
    width: number;
    height: number;
  } | null;
  selectedLng?: string;
};

const OrderArticlePDF = React.memo(
  ({
    articleOrder,
    userInfo,
    logoSrc,
    currencyCode,
    logoDimensions,
    selectedLng,
    translate,
  }: Props) => {
    const articleItems = convertToArticleOrderItemRecord(articleOrder?.items!);

    const totalVATMap = calculateTotalVAT(articleItems);

    const uniqueVATPercentages = [
      ...new Set(
        articleItems?.map((item) => item.unitSellingAmount.percentageVat),
      ),
    ];

    const boldFontStyle = {
      fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
    };

    const regularFontStyle = {
      fontFamily:
        selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
    };

    const styles = getStyles(boldFontStyle, regularFontStyle);

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View>
            <PdfTemplateHeader
              logoSrc={logoSrc}
              logoDimensions={logoDimensions}
            />

            <View style={styles.topSection}>
              <View style={styles.leftAddress}>
                {(userInfo?.serviceCompany?.businessAddress?.fullName ||
                  userInfo?.serviceCompany?.name) && (
                  <Text style={styles.addressText}>
                    {userInfo?.serviceCompany?.name},{' '}
                    {userInfo?.serviceCompany?.businessAddress?.fullName}
                  </Text>
                )}

                <View style={styles.partAddress}>
                  {articleOrder?.articleSupplier?.name && (
                    <Text style={styles.partialAddressText}>
                      {articleOrder?.articleSupplier?.name}
                    </Text>
                  )}

                  {articleOrder?.articleSupplier?.address?.component
                    ?.street && (
                    <Text style={styles.partialAddressText}>
                      {
                        articleOrder?.articleSupplier?.address?.component
                          ?.street
                      }
                    </Text>
                  )}

                  {articleOrder?.articleSupplier?.address?.component
                    ?.street2 && (
                    <Text style={styles.partialAddressText}>
                      {
                        articleOrder?.articleSupplier?.address?.component
                          ?.street2
                      }
                    </Text>
                  )}

                  <Text style={styles.partialAddressText}>
                    {articleOrder?.articleSupplier?.address?.component
                      ?.postalCode &&
                      `${articleOrder?.articleSupplier?.address?.component?.postalCode}`}
                    {articleOrder?.articleSupplier?.address?.component?.state &&
                      ` ${articleOrder?.articleSupplier?.address?.component?.state},`}
                    {articleOrder?.articleSupplier?.address?.component
                      ?.country &&
                      ` ${articleOrder?.articleSupplier?.address?.component?.country}`}
                  </Text>
                </View>
              </View>

              <View style={styles.rightAddress}>
                {articleOrder?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {translate('Order no.')}</Text>
                    <Text style={styles.tagContent}>
                      {articleOrder?.externalId || '-'}
                    </Text>
                  </View>
                )}

                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}> {translate('Order date')}</Text>
                  <Text style={styles.tagContent}>
                    {formatDate(articleOrder?.meta.createdAt) || '-'}
                  </Text>
                </View>

                {(articleOrder?.meta.creator?.firstName ||
                  articleOrder?.meta.creator?.lastName) && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {translate('Generated by')}</Text>
                    <Text style={styles.tagContent}>
                      {articleOrder?.meta.creator?.firstName}{' '}
                      {articleOrder?.meta.creator?.lastName}
                    </Text>
                  </View>
                )}

                {articleOrder?.articleSupplier?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {translate('Supplier no.')}</Text>
                    <Text style={styles.tagContent}>
                      {articleOrder?.articleSupplier?.externalId || '-'}{' '}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View>
              <Text style={styles.contentHeader}>
                {translate('Article Order for')} {articleOrder?.externalId}
              </Text>
              <Text style={styles.contentBody}>
                {articleOrder?.description}
              </Text>

              <View style={styles.table}>
                <View style={styles.tableHead}>
                  <View style={styles.tableRow}>
                    <Text
                      style={{
                        width: '2%',
                        textAlign: 'left',
                        marginRight: 10,
                        ...styles.tableHeading,
                      }}>
                      #
                    </Text>
                    <Text
                      style={{
                        width: '43%',
                        textAlign: 'left',
                        ...styles.tableHeading,
                      }}>
                      {translate('ARTICLE NAME')}
                    </Text>
                    <Text
                      style={{
                        width: '14%',
                        textAlign: 'left',
                        ...styles.tableHeading,
                      }}>
                      {translate('SUPPLIER ID')}
                    </Text>
                    <Text
                      style={{
                        width: '8%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {translate('QUANTITY')}
                    </Text>
                    <Text
                      style={{
                        width: '7%',
                        textAlign: 'center',
                        marginLeft: 10,
                        ...styles.tableHeading,
                      }}>
                      {translate('UNIT')}
                    </Text>
                    <Text
                      style={{
                        width: '13%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {translate('PRICE')}
                    </Text>
                    <Text
                      style={{
                        width: '15%',
                        textAlign: 'right',
                        marginRight: 4,
                        ...styles.tableHeading,
                      }}>
                      {' '}
                      {translate('TOTAL')}
                    </Text>
                  </View>
                </View>

                <View style={styles.dataBody}>
                  {articleOrder?.items.map((articleOrderItem, index) => (
                    <View key={`${articleOrderItem.id} - ${index}`}>
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
                        <Text
                          style={{
                            width: '43%',
                            textAlign: 'left',
                            color: '#212121',
                          }}>
                          {articleOrderItem.articleName || '-'}
                        </Text>
                        <Text
                          style={{
                            width: '14%',
                            textAlign: 'left',
                            color: '#212121',
                          }}>
                          {articleOrderItem.supplierArticleNumber || '-'}
                        </Text>
                        <Text
                          style={{
                            width: '8%',
                            textAlign: 'right',
                            color: '#212121',
                          }}>
                          {articleOrderItem.quantity || '-'}
                        </Text>
                        <Text
                          style={{
                            width: '7%',
                            textAlign: 'center',
                            marginLeft: 10,
                            color: '#212121',
                          }}>
                          {articleOrderItem.unit || '-'}
                        </Text>
                        <Text
                          style={{
                            width: '13%',
                            textAlign: 'right',
                            color: '#212121',
                          }}>
                          {formatCurrency(
                            (articleOrderItem.article?.unitSellingAmount
                              ?.netAmount ?? 0) /
                              10 **
                                articleOrderItem.article.unitSellingAmount
                                  .fractionDigits ?? 0,
                            {
                              currency: currencyCode,
                            },
                          )}
                        </Text>
                        <Text
                          style={{
                            width: '15%',
                            textAlign: 'right',
                            color: '#212121',
                          }}>
                          {formatCurrency(
                            ((articleOrderItem.article?.unitSellingAmount
                              ?.netAmount ?? 0) *
                              articleOrderItem.quantity) /
                              10 **
                                articleOrderItem.article.unitSellingAmount
                                  .fractionDigits ?? 0,
                            {
                              currency: currencyCode,
                            },
                          )}
                        </Text>
                      </View>
                      {articleOrderItem?.description.trim() !== '' && (
                        <Text style={styles.descriptionText}>
                          {articleOrderItem?.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>

                <View>
                  <View style={styles.tableRow}>
                    <Text style={{width: '44%'}} />
                    <Text
                      style={{
                        width: '32%',
                        color: '#616161',
                        fontSize: 10,
                        textAlign: 'right',
                      }}>
                      {translate('Subtotal (excl. VAT)')}
                    </Text>
                    <Text
                      style={{
                        width: '24%',
                        textAlign: 'right',
                        fontSize: 1,
                      }}>
                      {formatCurrency(
                        calculateTotal(articleItems, currencyCode),
                      )}
                    </Text>
                  </View>

                  <View>
                    {uniqueVATPercentages?.map((vatPercentage) => (
                      <View style={styles.tableRow} key={vatPercentage}>
                        <Text style={{width: '44%'}} />
                        <Text
                          style={{
                            width: '32%',
                            color: '#616161',
                            fontSize: 10,
                            textAlign: 'right',
                          }}>
                          {translate('VAT')} {vatPercentage}%
                        </Text>
                        <Text
                          style={{
                            width: '24%',
                            textAlign: 'right',
                            fontSize: 10,
                          }}>
                          {formatCurrency(totalVATMap.get(vatPercentage) ?? 0, {
                            currency: currencyCode,
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
                      }}>
                      {translate('Total (incl. VAT)')}
                    </Text>
                    <Text
                      style={{
                        width: '24%',
                        textAlign: 'right',
                        color: '#212121',
                        ...boldFontStyle,
                        fontSize: 1,
                      }}>
                      {formatCurrency(
                        calculateTotal(articleItems) +
                          Array.from(totalVATMap.values()).reduce(
                            (acc, curr) => acc + curr,
                            0,
                          ),
                        {
                          currency: currencyCode,
                        },
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <PdfTemplateFooter
            userInfo={userInfo}
            selectedLng={selectedLng}
            translate={translate}
          />
        </Page>
      </Document>
    );
  },
);

export default OrderArticlePDF;
