import {Document, Text, View, StyleSheet, Font} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import React from 'react';
import {ServiceOrderArticleView, ServiceOrderView} from 'models/service-order';
import {formatDate} from 'utils/datetime';
import {Currencies, formatCurrency, getCurrencySymbol} from 'utils/currency';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import {QuotationView} from 'models/quotation';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency, HeaderFooterInfoData} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {formatAddressFullname} from 'utils/utils';
import PdfBodyContainer from 'components/pdf-templates/containers/PdfBodyContainer';
import PdfPageContainer from 'components/pdf-templates/containers/PdfPageContainer';
import TopSectionContainer from 'components/pdf-templates/containers/TopSectionContainer';
import PdfPageTitle from 'components/pdf-templates/containers/PdfPageTitle';
import {DiscountType} from 'models/invoice';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
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
      fontSize: 10,
      color: '#212121',
      width: '43%',
    },
    tagContent: {
      fontSize: 10,
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
      width: '45%',
      display: 'flex',
      fontSize: 8,
      color: '#212121',
      paddingLeft: 20,
      letterSpacing: -0.15,
      marginTop: 2,
      lineHeight: 1.3,
    },
  });

type Props = {
  translate: (key: string) => string;
  userInfo?: UserAccount | undefined;
  currentCurrency?: Currency;
  serviceOrder?: ServiceOrderView;
  quotation?: QuotationView;
  selectedLng?: string;
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
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
  }: Props) => {
    const articleItems = serviceOrder?.articles!;

    const netTotal = (articleItem: ServiceOrderArticleView) => {
      const grossTotal =
        (articleItem.unitAmount?.netAmount ?? 0) * articleItem.quantity;
      const discountValue =
        articleItem?.additionalInfo?.discount?.amount?.value ?? 0;

      return (
        (grossTotal - discountValue) /
          10 ** articleItem.unitAmount.fractionDigits ?? 2
      );
    };

    const calculateTotal = (arr: ServiceOrderArticleView[]) => {
      const sum = 0;

      return arr
        .map(
          (arrayItem) =>
            arrayItem.quantity *
            (arrayItem.unitAmount.netAmount /
              10 ** Currencies[arrayItem.unitAmount.currency] ??
              (currentCurrency && currentCurrency.code)),
        )
        .reduce((prevValue, currentValue) => prevValue + currentValue, sum);
    };

    const calculateTotalVAT = (items: any[]) => {
      const vatMap = new Map();
      items?.forEach((item) => {
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

    const allItemsHaveZeroDiscount = articleItems.every(
      (item) =>
        item?.additionalInfo?.discount?.amount?.value === 0 ||
        item?.additionalInfo?.discount?.percentage === 0,
    );

    const elevatorAddress = serviceOrder?.elevator?.address;

    const globalDiscount = getDiscoutObj(quotation?.additionalInfo?.discount);
    const discountAmount = globalDiscount?.amount;
    const discountValue = discountAmount?.value ?? 0;

    const shouldDisplayDash = (articleOrderItem: ServiceOrderArticleView) => {
      if (!articleOrderItem || !articleOrderItem.additionalInfo) return '';

      const additionalInfo = articleOrderItem?.additionalInfo;
      const hasAdditionalInfo = Object.keys(additionalInfo).length !== 0;
      const discount = additionalInfo?.discount;
      const hasDiscount = discount?.type !== DiscountType.NONE;
      const hasDiscountValue =
        discount?.percentage !== 0 || discount?.amount?.value !== 0;

      return hasAdditionalInfo && hasDiscount && hasDiscountValue ? '-' : '';
    };

    const boldFontStyle = {
      fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
    };

    const styles = getStyles(boldFontStyle);

    return (
      <Document>
        <PdfPageContainer selectedLng={selectedLng}>
          <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

          <PdfBodyContainer>
            <TopSectionContainer>
              <PdfTemplateLeftAddress
                companyName={userInfo?.serviceCompany?.name}
                billingAddressName={
                  userInfo?.serviceCompany?.billingAddress?.fullName
                }
                receiverName={serviceOrder?.elevator?.propertyOwner?.name}
                addressComponent={
                  serviceOrder?.elevator.propertyOwner.billingAddress?.component
                }
                selectedLng={selectedLng}
                translate={translate}
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

                {(serviceOrder?.meta.creator?.firstName ||
                  serviceOrder?.meta.creator?.lastName) && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Generated by')}</Text>
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

                {quotation?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Quotation no.')}</Text>
                    <Text style={styles.tagContent}>
                      {quotation?.externalId}
                    </Text>
                  </View>
                )}

                <View style={{marginTop: 20}}>
                  {serviceOrder?.elevator.externalId && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}>{translate('Unit no.')}</Text>
                      <Text style={styles.tagContent}>
                        {serviceOrder?.elevator.externalId}
                      </Text>
                    </View>
                  )}

                  {serviceOrder?.elevator.address.fullName && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}>
                        {translate('Unit address')}
                      </Text>
                      <Text style={styles.tagContent}>
                        {formatAddressFullname(elevatorAddress)?.fullCityName}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TopSectionContainer>

            <View>
              <PdfPageTitle>
                {translate('Job Confirmation:')}{' '}
                {translate(serviceOrderTypeToString(serviceOrder?.type!))}
              </PdfPageTitle>

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
                    {!allItemsHaveZeroDiscount && (
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
                        width: allItemsHaveZeroDiscount ? '25%' : '15%',
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
                            {translate(articleOrderItem.article.unit) || '-'}
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
                                currency: currentCurrency?.code,
                                excludeCurrencySymbol: true,
                                currencySymbol: currentCurrency?.symbol,
                                companyLang: selectedLng,
                              },
                            )}
                          </Text>
                          {!allItemsHaveZeroDiscount && (
                            <Text
                              style={{
                                width: '10%',
                                textAlign: 'right',
                                color: '#212121',
                              }}>
                              {shouldDisplayDash(articleOrderItem)}
                              {articleOrderItem?.additionalInfo?.discount
                                ?.type === DiscountType.PERCENTAGE
                                ? articleOrderItem?.additionalInfo?.discount
                                    .percentage
                                : (articleOrderItem?.additionalInfo?.discount
                                    ?.amount?.value || 0) /
                                  10 ** 2}
                              {articleOrderItem?.additionalInfo?.discount
                                ?.type === DiscountType.AMOUNT
                                ? getCurrencySymbol[currentCurrency?.code!]
                                : '%'}
                            </Text>
                          )}

                          <Text
                            style={{
                              width: allItemsHaveZeroDiscount ? '25%' : '15%',
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
                            rootStyle={styles.descriptionText}
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
                        {formatCurrency(calculateTotal(articleItems), {
                          currency: currentCurrency?.code,
                          excludeCurrencySymbol: true,
                          currencySymbol: currentCurrency?.symbol,
                          companyLang: selectedLng,
                        })}
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
                            {formatCurrency(
                              totalVATMap.get(vatPercentage) ?? 0,
                              {
                                currency: currentCurrency?.code,
                                excludeCurrencySymbol: true,
                                currencySymbol: currentCurrency?.symbol,
                                companyLang: selectedLng,
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
                        {`${translate('Total incl. VAT')} (${
                          currentCurrency?.symbol
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
                        {formatCurrency(
                          calculateTotal(articleItems) +
                            Array.from(totalVATMap.values()).reduce(
                              (acc, curr) => acc + curr,
                              0,
                            ),
                          {
                            currency: currentCurrency?.code,
                            excludeCurrencySymbol: true,
                            currencySymbol: currentCurrency?.symbol,
                            companyLang: selectedLng,
                          },
                        )}
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
          />
        </PdfPageContainer>
      </Document>
    );
  },
);

export default JobOverviewPdfTemplate;
