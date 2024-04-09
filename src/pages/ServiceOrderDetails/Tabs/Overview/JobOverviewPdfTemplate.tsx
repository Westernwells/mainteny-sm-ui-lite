import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {ServiceOrderArticleView, ServiceOrderView} from 'models/service-order';
import {formatDate} from 'utils/datetime';
import {Currencies, formatCurrency} from 'utils/currency';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import {QuotationView} from 'models/quotation';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import MontserratRegular from '../../../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';

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
  selectedLng?: string,
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
    },
    partAddress: {
      fontSize: 10,
      marginBottom: 4,
    },
    rightAddress: {
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
      textAlign: 'left',
    },
    dataBody: {
      borderBottom: '1px solid #212121',
      paddingBottom: 1,
    },
    contentHeader: {
      fontSize: 14,
      color: '#212121',
      marginBottom: 10,
      ...boldFontStyle,
      marginTop: selectedLng === 'KA' ? 270 : 220,
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
  });

type Props = {
  userInfo?: UserAccount | undefined;
  logoSrc?: string;
  currencyCode?: string;
  serviceOrder?: ServiceOrderView;
  logoDimensions?: {
    width: number;
    height: number;
  } | null;
  quotation?: QuotationView;
  selectedLng?: string;
};

const JobOverviewPdfTemplate = React.memo(
  ({
    userInfo,
    logoSrc,
    currencyCode,
    serviceOrder,
    logoDimensions,
    quotation,
    selectedLng,
  }: Props) => {
    const {t} = useTranslation();

    const articleItems = serviceOrder?.articles!;
    const calculateTotal = (arr: ServiceOrderArticleView[]) => {
      const sum = 0;

      return arr
        .map(
          (arrayItem) =>
            arrayItem.quantity *
            (arrayItem.unitAmount.netAmount /
              10 ** Currencies[arrayItem.unitAmount.currency] ?? currencyCode),
        )
        .reduce((prevValue, currentValue) => prevValue + currentValue, sum);
    };

    const calculateTotalVAT = (items: any[]) => {
      const vatMap = new Map();
      items.forEach((item) => {
        const {percentageVat, netAmount, fractionDigits} = item.unitAmount;
        const vat =
          ((percentageVat / 100) * (netAmount * item.quantity)) /
          10 ** (fractionDigits || 0);
        if (vatMap.has(percentageVat)) {
          vatMap.set(percentageVat, vatMap.get(percentageVat) + vat);
        } else {
          vatMap.set(percentageVat, vat);
        }
      });
      return vatMap;
    };

    const totalVATMap = calculateTotalVAT(articleItems);

    const uniqueVATPercentages = [
      ...new Set(articleItems?.map((item) => item.unitAmount.percentageVat)),
    ];

    const boldFontStyle = {
      fontFamily: selectedLng === 'KA' ? 'NotoSans-Bold' : 'Montserrat-Bold',
    };

    const regularFontStyle = {
      fontFamily:
        selectedLng === 'KA' ? 'NotoSans-Regular' : 'Montserrat-Regular',
    };

    const styles = getStyles(selectedLng, boldFontStyle, regularFontStyle);

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
                    {serviceOrder?.elevator.propertyOwner.name}
                  </Text>
                  <Text style={styles.partialAddressText}>
                    {
                      serviceOrder?.elevator.propertyOwner.billingAddress
                        ?.component?.street
                    }
                  </Text>
                  <Text style={styles.partialAddressText}>
                    {
                      serviceOrder?.elevator.propertyOwner.billingAddress
                        ?.component?.street2
                    }
                  </Text>
                  <Text style={styles.partialAddressText}>
                    {serviceOrder?.elevator.propertyOwner.billingAddress
                      ?.component?.postalCode &&
                      `${serviceOrder?.elevator.propertyOwner.billingAddress?.component?.postalCode}, `}
                    {serviceOrder?.elevator.propertyOwner.billingAddress
                      ?.component?.state &&
                      `${serviceOrder?.elevator.propertyOwner.billingAddress?.component?.state}, `}
                    {serviceOrder?.elevator.propertyOwner.billingAddress
                      ?.component?.country &&
                      `${serviceOrder?.elevator.propertyOwner.billingAddress?.component?.country}`}
                  </Text>
                </View>
              </View>

              <View style={styles.rightAddress}>
                {serviceOrder?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {t('Job no.')}</Text>
                    <Text style={styles.tagContent}>
                      {serviceOrder?.externalId || '-'}
                    </Text>
                  </View>
                )}

                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}> {t('Job date')}</Text>
                  <Text style={styles.tagContent}>
                    {formatDate(serviceOrder?.meta.createdAt) || '-'}
                  </Text>
                </View>

                {(serviceOrder?.meta.creator?.firstName ||
                  serviceOrder?.meta.creator?.lastName) && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {t('Generated by')}</Text>
                    <Text style={styles.tagContent}>
                      {serviceOrder?.meta.creator?.firstName}{' '}
                      {serviceOrder?.meta.creator?.lastName}
                    </Text>
                  </View>
                )}

                {serviceOrder?.elevator.propertyOwner.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {t('Customer no.')}</Text>
                    <Text style={styles.tagContent}>
                      {serviceOrder?.elevator.propertyOwner.number}
                    </Text>
                  </View>
                )}

                {serviceOrder?.meta.createdAt && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {t('Your order from')}</Text>
                    <Text style={styles.tagContent}>
                      {formatDate(serviceOrder?.meta.createdAt)}
                    </Text>
                  </View>
                )}

                {quotation?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {t('Quotation no.')}</Text>
                    <Text style={styles.tagContent}>
                      {quotation?.externalId}
                    </Text>
                  </View>
                )}

                <View style={{marginTop: 20}}>
                  {serviceOrder?.elevator.externalId && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}> {t('Unit no.')}</Text>
                      <Text style={styles.tagContent}>
                        {serviceOrder?.elevator.externalId}
                      </Text>
                    </View>
                  )}

                  {serviceOrder?.elevator.address.fullName && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}> {t('Unit address')}</Text>
                      <Text style={styles.tagContent}>
                        {serviceOrder?.elevator.address.fullName}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View>
              <Text style={styles.contentHeader}>
                {t('Job Confirmation: {{serviceOrderType}}', {
                  serviceOrderType: serviceOrderTypeToString(
                    serviceOrder?.type!,
                  ),
                })}
              </Text>

              {serviceOrder?.description.trim() !== '' && (
                <Text style={styles.contentBody}>
                  {serviceOrder?.description}
                </Text>
              )}

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
                        width: '50%',
                        textAlign: 'left',
                        ...styles.tableHeading,
                      }}>
                      {t('ARTICLE NAME')}
                    </Text>

                    <Text
                      style={{
                        width: '10%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {t('QUANTITY')}
                    </Text>
                    <Text
                      style={{
                        width: '8%',
                        textAlign: 'center',
                        marginLeft: 10,
                        ...styles.tableHeading,
                      }}>
                      {t('UNIT')}
                    </Text>
                    <Text
                      style={{
                        width: '15%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {t('PRICE')}
                    </Text>
                    <Text
                      style={{
                        width: '15%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {' '}
                      {t('TOTAL')}
                    </Text>
                  </View>
                </View>

                {serviceOrder?.articles.length! > 0 && (
                  <View style={styles.dataBody}>
                    {serviceOrder?.articles.map((articleOrderItem, index) => (
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
                              width: '50%',
                              textAlign: 'left',
                              color: '#212121',
                            }}>
                            {articleOrderItem.name || '-'}
                          </Text>

                          <Text
                            style={{
                              width: '10%',
                              textAlign: 'right',
                              color: '#212121',
                            }}>
                            {articleOrderItem.quantity || '-'}
                          </Text>
                          <Text
                            style={{
                              width: '8%',
                              textAlign: 'center',
                              marginLeft: 10,
                              color: '#212121',
                            }}>
                            {articleOrderItem.article.unit || '-'}
                          </Text>
                          <Text
                            style={{
                              width: '15%',
                              textAlign: 'right',
                              color: '#212121',
                            }}>
                            {formatCurrency(
                              (articleOrderItem.unitAmount?.netAmount ?? 0) /
                                10 **
                                  articleOrderItem.unitAmount.fractionDigits ??
                                0,
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
                              ((articleOrderItem.unitAmount?.netAmount ?? 0) *
                                articleOrderItem.quantity) /
                                10 **
                                  articleOrderItem.unitAmount.fractionDigits ??
                                0,
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
                )}

                {serviceOrder?.articles.length! > 0 && (
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
                        {formatCurrency(calculateTotal(articleItems))}
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
                            {formatCurrency(
                              totalVATMap.get(vatPercentage) ?? 0,
                              {
                                currency: currencyCode,
                              },
                            )}
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
                        {t('Total (incl. VAT)')}
                      </Text>
                      <Text
                        style={{
                          width: '24%',
                          textAlign: 'right',
                          color: '#212121',
                          ...boldFontStyle,
                          fontSize: 10,
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
                )}
              </View>
            </View>
          </View>

          <PdfTemplateFooter userInfo={userInfo} selectedLng={selectedLng} />
        </Page>
      </Document>
    );
  },
);

export default JobOverviewPdfTemplate;
