import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {ServiceOrderArticleView, ServiceOrderView} from 'models/service-order';
import {formatDate} from 'utils/datetime';
import {Currencies, formatCurrency} from 'utils/currency';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import MontserratRegular from '../../../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';

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

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Montserrat-Regular',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  leftAddress: {
    flex: '0 0 50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontFamily: 'Montserrat-Bold',
  },
  addressText: {
    fontSize: 8,
    marginBottom: 15,
  },
  partialAddressText: {
    fontSize: 10,
    marginBottom: 4,
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
    paddingBottom: 4,
  },
  tag: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 10,
    color: '#212121',
    flex: '0 0 45%',
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
    marginTop: 10,
    marginBottom: 10,
    fontFamily: 'Montserrat-Bold',
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
    fontSize: 10,
    fontWeight: 'light',
    color: '#616161',
    display: 'flex',
    flexDirection: 'column',
    paddingVertical: 1.5,
  },
  footerSectionBody: {
    fontSize: 5,
    fontWeight: 'light',
    color: '#616161',
    display: 'flex',
    flexDirection: 'column',
    paddingVertical: 0.5,
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
    flexDirection: 'row',
    flex: '0 0 75%',
    justifyContent: 'space-between',
  },
  emailText: {
    fontSize: 5,
    color: '#616161',
    fontWeight: 'light',
  },
  pageNumberText: {
    fontSize: 7,
    color: '#000000',
    marginLeft: 4,
    textAlign: 'right',
    fontFamily: 'Montserrat-Bold',
  },
  numberText: {
    color: '#212121',
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
    fontSize: 7,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: 10,
    marginVertical: 4,
  },
  footerContainer: {
    flexDirection: 'column',
    width: '100%',
    paddingTop: 10,
    marginTop: 105,
    height: 55,
    position: 'absolute',
    bottom: 25,
    left: 68,
    right: 45,
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
  footerContent: {
    marginRight: 10,
    maxWidth: 130,
    flex: '0 0 32%',
  },
  footerHeading: {
    paddingVertical: 0.5,
    fontSize: 5,
    fontFamily: 'Montserrat-Bold',
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
};

const JobOverviewPdfTemplate = React.memo(
  ({userInfo, logoSrc, currencyCode, serviceOrder, logoDimensions}: Props) => {
    const {t} = useTranslation();
    console.log(serviceOrder, 'serviceOrder');

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

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View>
            <View style={styles.header} fixed>
              {logoSrc && (
                <Image
                  style={{height: logoDimensions?.height || 35}}
                  source={logoSrc}
                />
              )}
            </View>

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
                      `${serviceOrder?.elevator.propertyOwner.billingAddress?.component?.postalCode},`}
                    {serviceOrder?.elevator.propertyOwner.billingAddress
                      ?.component?.state &&
                      `${serviceOrder?.elevator.propertyOwner.billingAddress?.component?.state},`}
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
                      {serviceOrder?.elevator.propertyOwner.externalId}
                    </Text>
                  </View>
                )}

                {serviceOrder?.elevator.propertyOwner.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {t('Your order from')}</Text>
                    <Text style={styles.tagContent}>
                      {serviceOrder?.elevator.propertyOwner.externalId}
                    </Text>
                  </View>
                )}

                {serviceOrder?.elevator.propertyOwner.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}> {t('Quotation no.')}</Text>
                    <Text style={styles.tagContent}>
                      {serviceOrder?.elevator.propertyOwner.externalId}
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
                          fontFamily: 'Montserrat-Bold',
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
                          fontFamily: 'Montserrat-Bold',
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

          <View fixed style={styles.footerContainer}>
            <View style={styles.footerWrapper}>
              <View style={styles.leftFooter}>
                <View style={{...styles.footerContent}}>
                  {userInfo?.serviceCompany.name && (
                    <Text style={styles.footerHeading}>
                      {userInfo?.serviceCompany?.name}
                    </Text>
                  )}

                  {userInfo?.serviceCompany.postalAddress?.fullName && (
                    <Text style={styles.footerSectionBody}>
                      {userInfo?.serviceCompany?.postalAddress?.fullName}
                    </Text>
                  )}

                  {userInfo?.serviceCompany?.postalAddress?.component?.state ||
                    (userInfo?.serviceCompany?.postalAddress?.component
                      ?.country && (
                      <Text style={styles.footerSectionBody}>
                        {
                          userInfo?.serviceCompany?.postalAddress?.component
                            ?.state
                        }
                        {userInfo?.serviceCompany?.postalAddress?.component
                          ?.state && '·'}
                        {
                          userInfo?.serviceCompany?.postalAddress?.component
                            ?.country
                        }
                      </Text>
                    ))}

                  {userInfo?.serviceCompany?.contact?.phone && (
                    <Text style={styles.footerSectionBody}>
                      {t('Tel.')}: {userInfo?.serviceCompany?.contact?.phone}
                    </Text>
                  )}
                </View>

                <View style={{...styles.footerContent}}>
                  <Text style={styles.footerHeading}>{t('Bank')}:</Text>

                  {userInfo?.serviceCompany?.settings?.paymentInfo
                    ?.accountNumber && (
                    <Text style={styles.footerSectionBody}>
                      {t('Acc. nr.')}:{' '}
                      {
                        userInfo?.serviceCompany?.settings?.paymentInfo
                          ?.accountNumber
                      }
                    </Text>
                  )}

                  {userInfo?.serviceCompany?.settings?.paymentInfo?.iban && (
                    <Text style={styles.footerSectionBody}>
                      {t('IBAN')}:{' '}
                      {userInfo?.serviceCompany?.settings?.paymentInfo?.iban}
                    </Text>
                  )}

                  {userInfo?.serviceCompany?.settings?.paymentInfo?.bic && (
                    <Text style={styles.footerSectionBody}>
                      {t('BIC')}:{' '}
                      {userInfo?.serviceCompany?.settings?.paymentInfo?.bic}
                    </Text>
                  )}
                </View>
                <View style={{...styles.footerContent}}>
                  {userInfo?.serviceCompany?.settings?.managingDirector && (
                    <Text style={styles.footerHeading}>
                      {t('Managing Director')}:{' '}
                      {userInfo?.serviceCompany?.settings?.managingDirector}
                    </Text>
                  )}

                  {userInfo?.serviceCompany?.settings?.arbitrationCourt && (
                    <Text style={styles.footerSectionBody}>
                      {t('Registration court')}:{' '}
                      {userInfo?.serviceCompany?.settings?.arbitrationCourt}
                    </Text>
                  )}

                  {userInfo?.serviceCompany?.settings?.vatId && (
                    <Text style={styles.footerSectionBody}>
                      {t('VAT ID')}: {userInfo?.serviceCompany?.settings?.vatId}{' '}
                    </Text>
                  )}

                  {userInfo?.serviceCompany?.settings?.tradeRegisterNumber && (
                    <Text style={styles.footerSectionBody}>
                      {t('Certified')}:{' '}
                      {userInfo?.serviceCompany?.settings?.tradeRegisterNumber}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.footerEmailWrapper}>
              <View style={styles.leftFooter}>
                {userInfo?.serviceCompany?.contact?.url && (
                  <View style={styles.footerContent}>
                    <Text style={styles.emailText}>
                      {userInfo?.serviceCompany?.contact?.url}
                    </Text>
                  </View>
                )}

                {userInfo?.serviceCompany.contact.email && (
                  <View style={{...styles.footerContent, marginLeft: 2}}>
                    <Text style={styles.emailText}>
                      {userInfo?.serviceCompany?.contact?.email}
                    </Text>
                  </View>
                )}

                <Text style={styles.footerContent} />
              </View>
              <View>
                <Text
                  style={styles.pageNumberText}
                  render={({pageNumber, totalPages}) =>
                    `${pageNumber} / ${totalPages}`
                  }
                />
              </View>
            </View>
          </View>
        </Page>
      </Document>
    );
  },
);

export default JobOverviewPdfTemplate;
