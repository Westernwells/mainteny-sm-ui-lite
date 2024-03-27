import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';
import {
  ArticleOrderItemRecord,
  ArticleOrderItemView,
  ArticleOrderView,
} from 'models/article';
import {UserAccount} from 'models/user';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Currencies, formatCurrency} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import font from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';

Font.register({
  family: 'Montserrat',
  format: 'truetype',
  src: font,
});

const styles = StyleSheet.create({
  logoImage: {
    height: '30px',
  },
  page: {
    fontFamily: 'Montserrat',
    fontSize: 8,
    padding: 35,
    backgroundColor: 'white',
    height: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'flex-end',
    marginTop: 20,
  },
  leftAddress: {
    flex: '0 0 65%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  addressText: {
    fontSize: 6,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  partialAddressText: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  partAddress: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rightAddress: {
    minWidth: 200,
    flex: '0 0 30%',
    display: 'flex',
    flexDirection: 'column',
  },
  rightAddressContent: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  tag: {
    fontWeight: 'bold',
    fontSize: 8,
    color: '#212121',
    flex: '0 0 40%',
  },
  tagContent: {
    fontSize: 8,
    color: '#616161',
    flex: '0 0 50%',
    textAlign: 'right',
  },
  dataBody: {
    borderBottom: '1px solid #212121',
    paddingBottom: 6,
  },
  contentHeader: {
    fontSize: 14,
    color: '#212121',
    marginTop: 15,
    marginBottom: 10,
    fontWeight: 'heavy',
  },
  contentBody: {
    color: '#616161',
    fontSize: 9,
    marginBottom: 20,
    lineHeight: 1.7,
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
    width: '15%',
    textAlign: 'left',
  },
  quantityColumn: {
    width: '8%',
    textAlign: 'right',
  },
  unitColumn: {
    width: '10%',
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
  footerEmail: {
    display: 'flex',
    flexDirection: 'row',
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
    fontSize: 7,
    fontWeight: 'light',
    color: '#616161',
    display: 'flex',
    flexDirection: 'column',
    paddingVertical: 1.5,
  },
  footerSectionBody: {
    fontSize: 6,
    fontWeight: 'light',
    color: '#616161',
    display: 'flex',
    flexDirection: 'column',
    paddingVertical: 1.5,
  },
  footerWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingBottom: 7,
    borderBottom: '1px solid #616161',
    alignItems: 'center',
    marginTop: 5,
  },
  footerEmailWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  leftFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    flex: '0 0 80%',
  },
  emailText: {
    fontSize: 6,
    color: '#616161',
    fontWeight: 'light',
  },
  numberText: {
    color: '#212121',
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
    color: '#8f9bb3',
    display: 'flex',
    fontWeight: 'extrabold',
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 8,
    fontSize: 10,
  },
  footerContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingTop: 7,
  },
  descriptionText: {
    width: '25%',
    display: 'flex',
    fontSize: 7,
    color: '#212121',
    paddingLeft: 25,
    letterSpacing: -0.15,
    marginTop: 4,
    lineHeight: 1.5,
  },
  qrCode: {
    width: 60,
    height: 60,
  },
});

type Props = {
  articleOrder?: ArticleOrderView | undefined;
  userInfo?: UserAccount | undefined;
  logoSrc?: string;
  currencyCode?: string;
};

const OrderArticlePDF = React.memo(
  ({articleOrder, userInfo, logoSrc, currencyCode}: Props) => {
    const {t} = useTranslation();

    function convertToArticleOrderItemRecord(
      items: ArticleOrderItemView[],
    ): ArticleOrderItemRecord[] {
      return items.map((item) => ({
        articleId: item.article.id,
        articleName: item.articleName,
        supplierArticleNumber: item.supplierArticleNumber,
        quantity: item.quantity,
        unit: item.unit,
        description: item.description,
        unitSellingAmount: item.article.unitSellingAmount,
      }));
    }

    const articleItems = convertToArticleOrderItemRecord(articleOrder?.items!);
    const calculateTotal = (arr: ArticleOrderItemRecord[]) => {
      const sum = 0;

      return arr
        .map(
          (arrayItem) =>
            arrayItem.quantity *
            (arrayItem.unitSellingAmount.netAmount /
              10 ** Currencies[arrayItem.unitSellingAmount.currency] ??
              currencyCode),
        )
        .reduce((prevValue, currentValue) => prevValue + currentValue, sum);
    };

    const calculateTotalVAT = (items: any[]) => {
      const vatMap = new Map();
      items.forEach((item) => {
        const {percentageVat, netAmount, fractionDigits} =
          item.unitSellingAmount;
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
      ...new Set(
        articleItems?.map((item) => item.unitSellingAmount.percentageVat),
      ),
    ];

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View>
            <View style={styles.header} fixed>
              {logoSrc && <Image style={styles.logoImage} source={logoSrc} />}
            </View>

            <View style={styles.topSection}>
              <View style={styles.leftAddress}>
                <Text style={styles.addressText}>
                  {userInfo?.serviceCompany.businessAddress?.fullName}
                </Text>

                <View style={styles.partAddress}>
                  <Text style={styles.partialAddressText}>
                    {articleOrder?.articleSupplier.name}
                  </Text>
                  <Text style={styles.partialAddressText}>
                    {articleOrder?.articleSupplier.address.component?.street}
                  </Text>
                  <Text style={styles.partialAddressText}>
                    {articleOrder?.articleSupplier.address.component?.street2}
                  </Text>
                  <Text style={styles.partialAddressText}>
                    {articleOrder?.articleSupplier.address.component
                      ?.postalCode &&
                      `${articleOrder?.articleSupplier.address.component?.postalCode},`}
                    {articleOrder?.articleSupplier.address.component?.state &&
                      `${articleOrder?.articleSupplier.address.component?.state},`}
                    {articleOrder?.articleSupplier.address.component?.country &&
                      `${articleOrder?.articleSupplier.address.component?.country}`}
                  </Text>
                </View>
              </View>

              <View style={styles.rightAddress}>
                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}> {t('Order number')}</Text>
                  <Text style={styles.tagContent}>
                    {articleOrder?.externalId || '-'}
                  </Text>
                </View>

                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}> {t('Order date')}</Text>
                  <Text style={styles.tagContent}>
                    {formatDate(articleOrder?.meta.createdAt) || '-'}
                  </Text>
                </View>

                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}> {t('Generated by')}</Text>
                  <Text style={styles.tagContent}>
                    {articleOrder?.meta.creator?.firstName}{' '}
                    {articleOrder?.meta.creator?.lastName}
                  </Text>
                </View>

                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}> {t('Supplier number')}</Text>
                  <Text style={styles.tagContent}>
                    {articleOrder?.articleSupplier.externalId || '-'}{' '}
                  </Text>
                </View>

                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}> {t('Customer number')}</Text>
                </View>
              </View>
            </View>

            <View>
              <Text style={styles.contentHeader}>
                {t('Article Order for {{externalId}}', {
                  externalId: articleOrder?.externalId,
                })}
              </Text>
              <Text style={styles.contentBody}>
                {articleOrder?.description}
              </Text>

              <View style={styles.table}>
                <View style={styles.tableHead}>
                  <View style={styles.tableRow}>
                    <Text
                      style={{
                        width: '5%',
                        textAlign: 'left',
                        ...styles.tableHeading,
                      }}>
                      #
                    </Text>
                    <Text
                      style={{
                        width: '25%',
                        textAlign: 'left',
                        ...styles.tableHeading,
                      }}>
                      {t('ARTICLE NAME')}
                    </Text>
                    <Text
                      style={{
                        width: '20%',
                        textAlign: 'left',
                        ...styles.tableHeading,
                      }}>
                      {t('SUPPLIER ID')}
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
                        width: '10%',
                        textAlign: 'center',
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

                <View style={styles.dataBody}>
                  {articleOrder?.items.map((articleOrderItem, index) => (
                    <View key={`${articleOrderItem.id} - ${index}`}>
                      <View style={styles.tableRow}>
                        <Text
                          style={{
                            width: '5%',
                            textAlign: 'left',
                            color: '#212121',
                          }}>
                          {index + 1}
                        </Text>
                        <Text
                          style={{
                            width: '25%',
                            textAlign: 'left',
                            color: '#212121',
                          }}>
                          {articleOrderItem.articleName || '-'}
                        </Text>
                        <Text
                          style={{
                            width: '20%',
                            textAlign: 'left',
                            color: '#212121',
                          }}>
                          {articleOrderItem.supplierArticleNumber || '-'}
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
                            width: '10%',
                            textAlign: 'center',
                            color: '#212121',
                          }}>
                          {articleOrderItem.unit || '-'}
                        </Text>
                        <Text
                          style={{
                            width: '15%',
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
                      <Text style={styles.descriptionText}>
                        {articleOrderItem.description}
                      </Text>
                    </View>
                  ))}
                </View>

                <View>
                  <View style={styles.tableRow}>
                    <Text style={{width: '54%'}} />
                    <Text
                      style={{
                        width: '26%',
                        color: '#616161',
                        fontSize: '9px',
                      }}>
                      {t('Subtotal (excl. VAT)')}
                    </Text>
                    <Text
                      style={{
                        width: '20%',
                        textAlign: 'right',
                        fontSize: '9px',
                      }}>
                      {formatCurrency(calculateTotal(articleItems))}
                    </Text>
                  </View>

                  <View>
                    {uniqueVATPercentages.map((vatPercentage) => (
                      <View style={styles.tableRow} key={vatPercentage}>
                        <Text style={{width: '54%'}} />
                        <Text
                          style={{
                            width: '26%',
                            color: '#616161',
                            fontSize: '9px',
                          }}>
                          {t('VAT {{vatPercentage}}%', {vatPercentage})}
                        </Text>
                        <Text
                          style={{
                            width: '20%',
                            textAlign: 'right',
                            fontSize: '8px',
                          }}>
                          {formatCurrency(totalVATMap.get(vatPercentage) ?? 0, {
                            currency: currencyCode,
                          })}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.tableRow}>
                    <Text style={{width: '54%'}} />
                    <Text
                      style={{
                        width: '26%',
                        color: '#212121',
                        fontWeight: 'bold',
                        fontSize: '8px',
                      }}>
                      {t('Total (incl. VAT)')}
                    </Text>
                    <Text
                      style={{
                        width: '20%',
                        textAlign: 'right',
                        color: '#212121',
                        fontWeight: 'bold',
                        fontSize: '8px',
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

              {/* TO DO: Implement logic for display of notes section and delivery section when backend is available */}

              {/* <View style={styles.notesSection}>
          <Text style={styles.sectionHeading}>{t('Notes')}</Text>
          <Text style={styles.sectionBody}>-</Text>
        </View> */}

              {/* <View style={styles.deliverySection}>
          <Text style={styles.sectionHeading}>{t('Delivery Address')}</Text>
          <View>
            <Text style={styles.sectionBody}>
              {' '}
              {articleOrder?.articleSupplier.name}{' '}
            </Text>
            <Text style={styles.sectionBody}>
              {' '}
              {
              articleOrder?.articleSupplier.address.component?.postalCode
              }{' '}
              {articleOrder?.articleSupplier.address.component?.street}
            </Text>
            <Text style={styles.sectionBody}>
              {' '}
              {
                articleOrder?.articleSupplier.address.component?.postalCode
              }{' '}
              {articleOrder?.articleSupplier.address.component?.street}
            </Text>
          </View>
        </View> */}
            </View>
          </View>

          <View fixed style={styles.footerContainer}>
            <View style={styles.footerWrapper}>
              <View style={styles.leftFooter}>
                <View style={{flex: '0 0 38%'}}>
                  <Text style={{paddingVertical: 3, fontSize: 6.5}}>
                    {userInfo?.serviceCompany.name}
                  </Text>
                  <Text style={styles.footerSectionBody}>
                    {userInfo?.serviceCompany.postalAddress?.fullName}
                  </Text>
                  <Text style={styles.footerSectionBody}>
                    {userInfo?.serviceCompany.postalAddress?.component?.state}
                    {userInfo?.serviceCompany.postalAddress?.component?.state &&
                      '·'}
                    {userInfo?.serviceCompany.postalAddress?.component?.country}
                  </Text>
                  <Text style={styles.footerSectionBody}>
                    {t('Tel.')}: {userInfo?.serviceCompany.contact.phone}
                  </Text>
                </View>
                <View style={{flex: '0 0 27%', marginRight: 4}}>
                  <Text style={{paddingVertical: 3, fontSize: 6.5}}>
                    {t('Bank')}:
                  </Text>
                  <Text style={styles.footerSectionBody}>
                    {t('Acc. nr.')}:{' '}
                    {
                      userInfo?.serviceCompany.settings.paymentInfo
                        .accountNumber
                    }
                  </Text>
                  <Text style={styles.footerSectionBody}>
                    {t('IBAN')}:{' '}
                    {userInfo?.serviceCompany.settings.paymentInfo.iban}
                  </Text>
                  <Text style={styles.footerSectionBody}>
                    {t('BIC')}:{' '}
                    {userInfo?.serviceCompany.settings.paymentInfo.bic}
                  </Text>
                </View>

                <View style={{flex: '0 0 31%', marginLeft: 4}}>
                  {userInfo?.serviceCompany.settings.managingDirector && (
                    <Text style={{paddingVertical: 3, fontSize: 6.5}}>
                      {t('Managing Director')}:{' '}
                      {userInfo?.serviceCompany.settings.managingDirector}
                    </Text>
                  )}

                  {userInfo?.serviceCompany.settings.arbitrationCourt && (
                    <Text style={styles.footerSectionBody}>
                      {t('Registration court')}:{' '}
                      {userInfo?.serviceCompany.settings.arbitrationCourt}
                    </Text>
                  )}

                  {userInfo?.serviceCompany.settings.vatId && (
                    <Text style={styles.footerSectionBody}>
                      {t('VAT ID')}: {userInfo?.serviceCompany.settings.vatId}{' '}
                    </Text>
                  )}

                  {userInfo?.serviceCompany.settings.tradeRegisterNumber && (
                    <Text style={styles.footerSectionBody}>
                      {t('Certified')}:{' '}
                      {userInfo?.serviceCompany.settings.tradeRegisterNumber}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.footerEmailWrapper}>
              <View style={styles.leftFooter}>
                <Text style={{...styles.emailText, flex: '0 0 38%'}}>
                  {userInfo?.serviceCompany.contact.url}
                </Text>
                <Text
                  style={{
                    ...styles.emailText,
                    flex: '0 0 27%',
                    marginRight: 4,
                  }}>
                  {userInfo?.serviceCompany.contact.email}
                </Text>
                <Text
                  style={{...styles.emailText, flex: '0 0 31%', marginLeft: 4}}
                />
              </View>
              <Text
                style={{...styles.emailText, marginLeft: 4, textAlign: 'right'}}
                render={({pageNumber, totalPages}) =>
                  `${pageNumber} / ${totalPages}`
                }
              />
            </View>
          </View>
        </Page>
      </Document>
    );
  },
);

export default OrderArticlePDF;
