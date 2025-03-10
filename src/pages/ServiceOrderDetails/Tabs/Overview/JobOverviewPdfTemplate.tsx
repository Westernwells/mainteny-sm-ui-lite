import {Document, Font, StyleSheet, Text, View} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import React, {useMemo} from 'react';
import {ServiceOrderArticleView, ServiceOrderView} from 'models/service-order';
import {formatDate} from 'utils/datetime';
import {centsToMoney, formatCurrency, getCurrencySymbol} from 'utils/currency';
import {QuotationView} from 'models/quotation';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency, HeaderFooterInfoData} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import PdfBodyContainer from 'components/pdf-templates/containers/PdfBodyContainer';
import PdfPageContainer from 'components/pdf-templates/containers/PdfPageContainer';
import TopSectionContainer from 'components/pdf-templates/containers/TopSectionContainer';
import PdfPageTitle from 'components/pdf-templates/containers/PdfPageTitle';
import {DiscountType} from 'models/invoice';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
import {
  calculateArticlesAmount,
  getItemTotalAfterPerItemDiscount,
} from 'utils/calculate-total';
import {
  allItemsHaveZeroDiscount,
  shouldDisplayDiscountDash,
} from 'utils/discount';
import PdfUnitAddress from 'components/pdf-templates/containers/PdfUnitAddress';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {toSentenceCase} from 'utils/string';
import {
  getAddressComponentFromQuotation,
  getAddressComponentFromServiceOrder,
} from 'utils/pdfTemplates';
import MontserratRegular from '../../../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import {HtmlPDF} from '../../../../components/HtmlPDF';

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

const getStyles = (boldFontStyle?: {fontFamily: string}) =>
  StyleSheet.create({
    rightAddress: {
      flex: '0 0 42%',
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
      fontSize: 8.5,
      color: '#212121',
      width: '43%',
    },
    tagContent: {
      fontSize: 8.5,
      color: '#616161',
      width: '57%',
      textAlign: 'right',
    },
    dataBody: {
      borderBottom: '1px solid #212121',
      paddingBottom: 1,
    },
    contentBody: {
      color: '#212121',
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
      width: '87%',
      display: 'flex',
      fontSize: 8.5,
      color: '#212121',
      paddingLeft: 20,
      paddingRight: 10,
      letterSpacing: -0.15,
      marginVertical: 4,
      lineHeight: 1.55,
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
    },
  });

type Props = {
  translate: (key: string, options?: {context: string}) => string;
  userInfo?: UserAccount | undefined;
  currentCurrency?: Currency;
  serviceOrder?: ServiceOrderView;
  quotation?: QuotationView;
  selectedLng?: string;
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
  pdfConfigClientStorage: ClientReportForPDFConfig;
  serviceOrderType: string;
};

const JobOverviewPdfTemplate = React.memo(
  ({
    translate,
    userInfo,
    currentCurrency,
    serviceOrder,
    quotation,
    selectedLng,
    headerInfo,
    headerPath,
    footerInfo,
    footerPath,
    pdfConfigClientStorage,
    serviceOrderType,
  }: Props) => {
    const articleItems = serviceOrder?.articles!;

    const netTotal = (articleItem: ServiceOrderArticleView) => {
      const total = getItemTotalAfterPerItemDiscount({
        item: {
          unitAmount: {
            netAmount: articleItem?.unitAmount?.netAmount,
          },
          quantity: articleItem.quantity,
          discount: articleItem?.additionalInfo?.discount,
        },
        precision: 0,
      });

      return centsToMoney(currentCurrency?.code!, total);
    };

    const elevatorAddress =
      quotation?.elevator.address ?? serviceOrder?.elevator?.address;

    const globalDiscount = getDiscoutObj(quotation?.additionalInfo?.discount);
    const discountAmount = globalDiscount?.amount;
    const discountValue = discountAmount?.value ?? 0;

    const {vats, amountAfterGlobalDiscountWithVAT, amountAfterGlobalDiscount} =
      useMemo(
        () =>
          calculateArticlesAmount({
            items: articleItems,
            globalDiscount,
          }),
        [articleItems, globalDiscount],
      );

    const amountAfterGlobalDiscountFormatted = formatCurrency(
      amountAfterGlobalDiscount,
      {currency: currentCurrency?.code},
    );

    const vatsFormatted = vats.map((vat) => ({
      ...vat,
      vat: formatCurrency(vat.vat, {
        currency: currentCurrency?.code,
        excludeCurrencySymbol: true,
        currencySymbol: currentCurrency?.symbol,
        companyLang: selectedLng,
      }),
    }));

    const amountAfterGlobalDiscountWithVATFormatted = formatCurrency(
      amountAfterGlobalDiscountWithVAT,
      {
        currency: currentCurrency?.code,
        excludeCurrencySymbol: true,
        currencySymbol: currentCurrency?.symbol,
        companyLang: selectedLng,
      },
    );

    const serviceCompanyInfo = getServiceCompanyInfo(
      userInfo,
      quotation?.additionalInfo.alternativeServiceCompanyInfo,
    );

    const boldFontStyle = {
      fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
    };

    const styles = getStyles(boldFontStyle);

    const customerVATId =
      (pdfConfigClientStorage.includeCustomerVAT &&
        serviceOrder?.elevator?.propertyOwner?.additionalInfo?.vatId) ||
      '';

    const eanValue =
      serviceOrder?.elevator?.propertyOwner?.additionalInfo.ean || '';

    const unitBuilding =
      (pdfConfigClientStorage.includeUnitBuilding &&
        serviceOrder?.elevator?.additionalInfo?.buildingLocation) ||
      '';
    return (
      <Document>
        <PdfPageContainer selectedLng={selectedLng}>
          <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

          <PdfBodyContainer>
            <TopSectionContainer>
              <PdfTemplateLeftAddress
                serviceCompanyInfo={serviceCompanyInfo}
                fallbackReceiverName={
                  serviceOrder?.elevator?.propertyOwner?.name
                }
                addressComponent={
                  getAddressComponentFromQuotation(quotation) ??
                  getAddressComponentFromServiceOrder(serviceOrder)
                }
                selectedLng={selectedLng}
                translate={translate}
                customerVATId={customerVATId}
                eanValue={eanValue}
              />

              <View style={styles.rightAddress}>
                {serviceOrder?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Job no.')}</Text>
                    <Text style={styles.tagContent}>
                      {serviceOrder?.externalId || '-'}
                    </Text>
                  </View>
                )}

                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}>{translate('Job date')}</Text>
                  <Text style={styles.tagContent}>
                    {formatDate(serviceOrder?.meta.createdAt) || '-'}
                  </Text>
                </View>

                {pdfConfigClientStorage.includeUsername &&
                  (serviceOrder?.meta.creator?.firstName ||
                    serviceOrder?.meta.creator?.lastName) && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}>
                        {translate('Generated by')}
                      </Text>
                      <Text style={styles.tagContent}>
                        {serviceOrder?.meta.creator?.firstName}{' '}
                        {serviceOrder?.meta.creator?.lastName}
                      </Text>
                    </View>
                  )}

                {serviceOrder?.elevator?.propertyOwner?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Customer no.')}</Text>
                    <Text style={styles.tagContent}>
                      {serviceOrder?.elevator?.propertyOwner?.externalId}
                    </Text>
                  </View>
                )}

                {serviceOrder?.meta.createdAt && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>
                      {translate('Your order from')}
                    </Text>
                    <Text style={styles.tagContent}>
                      {formatDate(serviceOrder?.meta.createdAt)}
                    </Text>
                  </View>
                )}
                {userInfo?.contact.phone &&
                  pdfConfigClientStorage.includeUserPhone && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}>
                        {translate('Phone number')}
                      </Text>
                      <Text style={styles.tagContent}>
                        {userInfo?.contact.phone}
                      </Text>
                    </View>
                  )}
                {userInfo?.contact.email &&
                  pdfConfigClientStorage.includeUserEmail && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}>
                        {translate('Email address')}
                      </Text>
                      <Text style={styles.tagContent}>
                        {userInfo?.contact.email}
                      </Text>
                    </View>
                  )}

                {quotation?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Quotation no.')}</Text>
                    <Text style={styles.tagContent}>
                      {quotation?.externalId}
                    </Text>
                  </View>
                )}

                <View style={{marginTop: 20}}>
                  {pdfConfigClientStorage.includeUnitNumber &&
                    serviceOrder?.elevator.externalId && (
                      <View style={styles.rightAddressContent}>
                        <Text style={styles.tag}>
                          {translate('Unit no.', {context: 'elevator'})}
                        </Text>
                        <Text style={styles.tagContent}>
                          {serviceOrder?.elevator.externalId}
                        </Text>
                      </View>
                    )}
                  {serviceOrder?.elevator.serialNumber &&
                    pdfConfigClientStorage.includeSerialNumber && (
                      <View style={styles.rightAddressContent}>
                        <Text style={styles.tag}>
                          {translate('Serial number')}
                        </Text>
                        <Text style={styles.tagContent}>
                          {serviceOrder?.elevator.serialNumber || '-'}
                        </Text>
                      </View>
                    )}

                  <PdfUnitAddress
                    address={elevatorAddress}
                    translate={translate}
                    selectedLng={selectedLng}
                    building={unitBuilding}
                  />
                </View>
              </View>
            </TopSectionContainer>

            <View>
              <PdfPageTitle>
                {translate('Job Confirmation:')}{' '}
                {toSentenceCase(serviceOrderType)}
              </PdfPageTitle>

              {serviceOrder?.description.trim() !== '' && (
                <HtmlPDF
                  html={serviceOrder?.description || ''}
                  selectedLng={selectedLng}
                  rootStyle={{
                    marginTop: 6,
                    marginBottom: 16,
                  }}
                />
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
                        width: '40%',
                        textAlign: 'left',
                        ...styles.tableHeading,
                      }}>
                      {translate('Article Name')}
                    </Text>

                    <Text
                      style={{
                        width: '10%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {translate('Quantity')}
                    </Text>
                    <Text
                      style={{
                        width: '8%',
                        textAlign: 'center',
                        marginLeft: 10,
                        ...styles.tableHeading,
                      }}>
                      {translate('Unit')}
                    </Text>
                    <Text
                      style={{
                        width: '15%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {`${translate('Price')} (${
                        getCurrencySymbol[currentCurrency?.code!]
                      })`}
                    </Text>
                    {!allItemsHaveZeroDiscount(articleItems) && (
                      <Text
                        style={{
                          width: '10%',
                          textAlign: 'right',
                          ...styles.tableHeading,
                        }}>
                        {translate('Discount')}
                      </Text>
                    )}

                    <Text
                      style={{
                        width: allItemsHaveZeroDiscount(articleItems)
                          ? '25%'
                          : '15%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {' '}
                      {`${translate('Total')} (${
                        getCurrencySymbol[currentCurrency?.code!]
                      })`}
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

                          <HtmlPDF
                            html={articleOrderItem.name || '-'}
                            rootStyle={{
                              width: '40%',
                              textAlign: 'left',
                              color: '#212121',
                            }}
                            stylesheet={{
                              p: {
                                marginBottom: '2px',
                              },
                            }}
                          />

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
                            {translate(articleOrderItem.article?.unit) || '-'}
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
                                  (articleOrderItem.unitAmount.fractionDigits ??
                                    2),
                              {
                                currency: currentCurrency?.code,
                                excludeCurrencySymbol: true,
                                currencySymbol: currentCurrency?.symbol,
                                companyLang: selectedLng,
                              },
                            )}
                          </Text>
                          {!allItemsHaveZeroDiscount(articleItems) && (
                            <Text
                              style={{
                                width: '10%',
                                textAlign: 'right',
                                color: '#212121',
                              }}>
                              {shouldDisplayDiscountDash(articleOrderItem)}
                              {articleOrderItem?.additionalInfo?.discount
                                ?.type === DiscountType.PERCENTAGE
                                ? articleOrderItem?.additionalInfo?.discount
                                    .percentage
                                : formatCurrency(
                                    centsToMoney(
                                      currentCurrency?.code!,
                                      articleOrderItem?.additionalInfo?.discount
                                        ?.amount?.value,
                                    ),
                                    {
                                      currency: currentCurrency?.code,
                                      excludeCurrencySymbol: true,
                                      currencySymbol: currentCurrency?.symbol,
                                      companyLang: selectedLng,
                                      minimumFractionDigits:
                                        articleOrderItem?.additionalInfo
                                          ?.discount?.amount?.value === 0
                                          ? 0
                                          : 2,
                                      maximumFractionDigits:
                                        articleOrderItem?.additionalInfo
                                          ?.discount?.amount?.value === 0
                                          ? 0
                                          : 2,
                                    },
                                  )}
                              {articleOrderItem?.additionalInfo?.discount
                                ?.type === DiscountType.AMOUNT
                                ? getCurrencySymbol[currentCurrency?.code!]
                                : '%'}
                            </Text>
                          )}

                          <Text
                            style={{
                              width: allItemsHaveZeroDiscount(articleItems)
                                ? '25%'
                                : '15%',
                              textAlign: 'right',
                              color: '#212121',
                            }}>
                            {formatCurrency(netTotal(articleOrderItem), {
                              currency: currentCurrency?.code,
                              excludeCurrencySymbol: true,
                              currencySymbol: currentCurrency?.symbol,
                              companyLang: selectedLng,
                            })}
                          </Text>
                        </View>
                        {articleOrderItem?.description.trim() !== '' && (
                          <HtmlPDF
                            html={articleOrderItem?.description || '-'}
                            rootStyle={{
                              ...styles.descriptionText,
                              marginBottom:
                                index === serviceOrder.articles.length - 1
                                  ? 0
                                  : 10,
                            }}
                          />
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {serviceOrder?.articles.length! > 0 && (
                  <View>
                    {discountValue && (
                      <View style={styles.tableRow}>
                        <Text style={{width: '44%'}} />
                        <Text
                          style={{
                            width: '32%',
                            color: '#616161',
                            fontSize: 10,
                            textAlign: 'right',
                          }}>
                          {`${translate('Discount')} (${
                            getCurrencySymbol[currentCurrency?.code!]
                          })`}
                        </Text>
                        <Text
                          style={{
                            width: '24%',
                            textAlign: 'right',
                            fontSize: 10,
                          }}>
                          -
                          {formatCurrency(discountValue, {
                            currency: currentCurrency?.code,
                            excludeCurrencySymbol: true,
                            currencySymbol: currentCurrency?.symbol,
                            companyLang: selectedLng,
                          })}
                        </Text>
                      </View>
                    )}

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
                        {amountAfterGlobalDiscountFormatted}
                      </Text>
                    </View>

                    <View style={styles.tableRow}>
                      <Text style={{width: '44%'}} />
                      <View style={{width: '56%'}}>
                        {vatsFormatted.map((v, index) => (
                          <View
                            key={`${index}-${v.percentageVat}`}
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              paddingVertical: 4,
                            }}>
                            <Text
                              style={{
                                color: '#616161',
                                fontSize: 10,
                                textAlign: 'right',
                                width: '57%',
                              }}>
                              {translate('VAT')} {v.percentageVat}%
                            </Text>
                            <Text
                              style={{
                                fontSize: 10,
                                textAlign: 'right',
                                width: '43%',
                              }}>
                              {v.vat}
                            </Text>
                          </View>
                        ))}
                      </View>
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
                        {`${translate('Total incl. VAT')} (${
                          getCurrencySymbol[currentCurrency?.code!]
                        })`}
                      </Text>
                      <Text
                        style={{
                          width: '24%',
                          textAlign: 'right',
                          color: '#212121',
                          ...boldFontStyle,
                          fontSize: 10,
                        }}>
                        {amountAfterGlobalDiscountWithVATFormatted}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </PdfBodyContainer>

          <PdfTemplateFooter
            userInfo={userInfo}
            selectedLng={selectedLng}
            translate={translate}
            footerInfo={footerInfo}
            footerPath={footerPath}
            isQuotationJobConfirmation={!!quotation?.externalId}
          />
        </PdfPageContainer>
      </Document>
    );
  },
);

export default JobOverviewPdfTemplate;
