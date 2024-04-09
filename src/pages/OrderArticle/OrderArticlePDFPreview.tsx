import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import {FormikProps} from 'formik';
import {ArticleSupplierView, CreateArticleOrderRecord} from 'models/article';
import {UserAccount} from 'models/user';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {formatCurrency} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import {calculateTotal, calculateTotalVAT} from './utils';

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
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 40,
      alignItems: 'flex-start',
      position: 'absolute',
      top: 110,
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
      marginTop: 150,
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
    numberColumn: {
      width: '7%',
      textAlign: 'left',
    },
    articleColumn: {
      width: '25%',
      textAlign: 'left',
    },
    supplierColumn: {
      width: '20%',
      textAlign: 'left',
    },
    quantityColumn: {
      width: '8%',
      textAlign: 'right',
    },
    unitColumn: {
      width: '5%',
      textAlign: 'center',
    },
    priceColumn: {
      width: '20%',
      textAlign: 'right',
    },
    totalColumn: {
      width: '15%',
      textAlign: 'right',
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
    qrCode: {
      width: 60,
      height: 60,
    },
  });

type Props = {
  supplier: ArticleSupplierView;
  formik: FormikProps<CreateArticleOrderRecord>;
  userInfo?: UserAccount | undefined;
  logoSrc?: string;
  currencyCode?: string;
  logoDimensions?: {
    width: number;
    height: number;
  } | null;
  selectedLng?: string;
};

const OrderArticlePDFPreview = React.memo(
  ({
    supplier,
    formik,
    userInfo,
    logoSrc,
    currencyCode,
    logoDimensions,
    selectedLng,
  }: Props) => {
    const {t} = useTranslation();
    const uniqueVATPercentages = [
      ...new Set(
        formik.values.items.map((item) => item.unitSellingAmount.percentageVat),
      ),
    ];

    const totalVATMap = calculateTotalVAT(formik.values.items);

    const boldFontStyle = {
      fontFamily: selectedLng === 'KA' ? 'NotoSans-Bold' : 'Montserrat-Bold',
    };

    const regularFontStyle = {
      fontFamily:
        selectedLng === 'KA' ? 'NotoSans-Regular' : 'Montserrat-Regular',
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
                <Text style={styles.addressText}>
                  {userInfo?.serviceCompany?.businessAddress?.fullName}
                </Text>

                <View style={styles.partAddress}>
                  <Text style={styles.partialAddressText}>
                    {supplier?.name}
                  </Text>
                  <Text style={styles.partialAddressText}>
                    {supplier?.address?.component?.street}
                  </Text>
                  <Text style={styles.partialAddressText}>
                    {supplier?.address?.component?.street2}
                  </Text>
                  <Text style={styles.partialAddressText}>
                    {supplier?.address?.component?.postalCode &&
                      `${supplier?.address?.component?.postalCode},`}
                    {supplier?.address?.component?.state &&
                      `${supplier?.address?.component?.state},`}
                    {supplier?.address?.component?.country &&
                      `${supplier?.address?.component?.country}`}
                  </Text>
                </View>
              </View>

              <View style={styles.rightAddress}>
                {formik?.values.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {t('Order no.')}</Text>
                    <Text style={styles.tagContent}>
                      {formik?.values.externalId || '-'}
                    </Text>
                  </View>
                )}

                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}> {t('Order date')}</Text>
                  <Text style={styles.tagContent}>
                    {formatDate(new Date()) || '-'}
                  </Text>
                </View>

                {(userInfo?.firstName || userInfo?.lastName) && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {t('Generated by')}</Text>
                    <Text style={styles.tagContent}>
                      {userInfo?.firstName} {userInfo?.lastName}
                    </Text>
                  </View>
                )}

                {supplier?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {t('Supplier no.')}</Text>
                    <Text style={styles.tagContent}>
                      {supplier?.externalId || '-'}{' '}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View>
              <Text style={styles.contentHeader}>
                {t('Article Order for {{externalId}}', {
                  externalId: formik?.values?.externalId,
                })}
              </Text>
              <Text style={styles.contentBody}>
                {formik?.values?.description}
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
                      {t('ARTICLE NAME')}
                    </Text>
                    <Text
                      style={{
                        width: '14%',
                        textAlign: 'left',
                        ...styles.tableHeading,
                      }}>
                      {t('SUPPLIER ID')}
                    </Text>
                    <Text
                      style={{
                        width: '8%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {t('QUANTITY')}
                    </Text>
                    <Text
                      style={{
                        width: '7%',
                        textAlign: 'center',
                        marginLeft: 10,
                        ...styles.tableHeading,
                      }}>
                      {t('UNIT')}
                    </Text>
                    <Text
                      style={{
                        width: '13%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {t('PRICE')}
                    </Text>
                    <Text
                      style={{
                        width: '15%',
                        textAlign: 'right',
                        marginRight: 4,
                        ...styles.tableHeading,
                      }}>
                      {' '}
                      {t('TOTAL')}
                    </Text>
                  </View>
                </View>

                <View style={styles.dataBody}>
                  {formik?.values.items.map((articleOrderItem, index) => (
                    <View key={`${articleOrderItem.articleId} - ${index}`}>
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
                            (articleOrderItem.unitSellingAmount.netAmount ??
                              0) /
                              (10 **
                                articleOrderItem.unitSellingAmount
                                  .fractionDigits ?? 0),
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
                            ((articleOrderItem.unitSellingAmount?.netAmount ??
                              0) *
                              articleOrderItem.quantity) /
                              10 **
                                articleOrderItem.unitSellingAmount
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
                      {t('Subtotal (excl. VAT)')}
                    </Text>
                    <Text
                      style={{
                        width: '24%',
                        textAlign: 'right',
                        fontSize: 10,
                      }}>
                      {formatCurrency(calculateTotal(formik.values.items ?? 0))}
                    </Text>
                  </View>

                  <View>
                    {uniqueVATPercentages.map((vatPercentage) => (
                      <View style={styles.tableRow} key={vatPercentage}>
                        <Text style={{width: '44%'}} />
                        <Text
                          style={{
                            width: '32%',
                            color: '#616161',
                            fontSize: 10,
                            textAlign: 'right',
                          }}>
                          {t('VAT {{vatPercentage}}%', {vatPercentage})}
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
                        fontSize: 10,
                        textAlign: 'right',
                        ...boldFontStyle,
                      }}>
                      {t('Total (incl. VAT)')}
                    </Text>
                    <Text
                      style={{
                        width: '24%',
                        textAlign: 'right',
                        color: '#212121',
                        fontSize: 10,
                        ...boldFontStyle,
                      }}>
                      {formatCurrency(
                        calculateTotal(formik.values.items) +
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

          <PdfTemplateFooter userInfo={userInfo} selectedLng={selectedLng} />
        </Page>
      </Document>
    );
  },
);

export default OrderArticlePDFPreview;
