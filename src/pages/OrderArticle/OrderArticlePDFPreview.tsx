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
import {formatCurrency} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import {Currency} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
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
      top: 90,
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
      color: '#616161',
      display: 'flex',
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
  translate: (key: string) => string;
  userInfo?: UserAccount | undefined;
  logoSrc?: string;
  currentCurrency?: Currency;
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
    currentCurrency,
    logoDimensions,
    selectedLng,
    translate,
  }: Props) => {
    const uniqueVATPercentages = [
      ...new Set(
        formik.values.items.map((item) => item.unitSellingAmount.percentageVat),
      ),
    ];

    const totalVATMap = calculateTotalVAT(formik.values.items);

    const boldFontStyle = {
      fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
    };

    const regularFontStyle = {
      fontFamily:
        selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
    };

    const styles = getStyles(boldFontStyle, regularFontStyle);
    console.log(
      userInfo?.serviceCompany?.billingAddress,
      'userInfo?.serviceCompany?.billingAddress',
    );
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View>
            <PdfTemplateHeader
              logoSrc={logoSrc}
              logoDimensions={logoDimensions}
            />

            <View style={styles.topSection}>
              <PdfTemplateLeftAddress
                companyName={userInfo?.serviceCompany?.name}
                billingAddressName={
                  userInfo?.serviceCompany?.billingAddress?.fullName
                }
                receiverName={supplier?.name}
                addressComponent={supplier?.address?.component}
                selectedLng={selectedLng}
              />

              <View style={styles.rightAddress}>
                {formik?.values.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {translate('Order no.')}</Text>
                    <Text style={styles.tagContent}>
                      {formik?.values.externalId || '-'}
                    </Text>
                  </View>
                )}

                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}> {translate('Order date')}</Text>
                  <Text style={styles.tagContent}>
                    {formatDate(new Date()) || '-'}
                  </Text>
                </View>

                {(userInfo?.firstName || userInfo?.lastName) && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {translate('Generated by')}</Text>
                    <Text style={styles.tagContent}>
                      {userInfo?.firstName} {userInfo?.lastName}
                    </Text>
                  </View>
                )}

                {supplier?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {translate('Supplier no.')}</Text>
                    <Text style={styles.tagContent}>
                      {supplier?.externalId || '-'}{' '}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View>
              <Text style={styles.contentHeader}>
                {translate('Article Order for')} {formik?.values?.externalId}
              </Text>

              <View>
                <Text style={styles.contentBody} wrap={false}>
                  {formik?.values?.description.split('')}
                </Text>
              </View>

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
                      {`${translate('PRICE')} (${currentCurrency?.symbol})`}
                    </Text>
                    <Text
                      style={{
                        width: '15%',
                        textAlign: 'right',
                        marginRight: 4,
                        ...styles.tableHeading,
                      }}>
                      {`${translate('TOTAL')} (${currentCurrency?.symbol})`}
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
                              currency: currentCurrency?.code,
                              excludeCurrencySymbol: true,
                              currencySymbol: currentCurrency?.symbol,
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
                              currency: currentCurrency?.code,
                              excludeCurrencySymbol: true,
                              currencySymbol: currentCurrency?.symbol,
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
                      {translate('Subtotal excl. VAT')}
                    </Text>
                    <Text
                      style={{
                        width: '24%',
                        textAlign: 'right',
                        fontSize: 10,
                      }}>
                      {formatCurrency(
                        calculateTotal(formik.values.items ?? 0),
                        {
                          currency: currentCurrency?.code,
                          excludeCurrencySymbol: true,
                          currencySymbol: currentCurrency?.symbol,
                        },
                      )}
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
                          {translate('VAT')} {vatPercentage}%
                        </Text>
                        <Text
                          style={{
                            width: '24%',
                            textAlign: 'right',
                            fontSize: 10,
                          }}>
                          {formatCurrency(totalVATMap.get(vatPercentage) ?? 0, {
                            currency: currentCurrency?.code,
                            excludeCurrencySymbol: true,
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
                        fontSize: 10,
                        textAlign: 'right',
                        ...boldFontStyle,
                      }}>
                      {`${translate('Total incl. VAT')} (${
                        currentCurrency?.symbol
                      })`}
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
                          currency: currentCurrency?.code,
                          excludeCurrencySymbol: true,
                          currencySymbol: currentCurrency?.symbol,
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

export default OrderArticlePDFPreview;
