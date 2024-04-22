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
import {ServiceOrderView} from 'models/service-order';
import {formatDate} from 'utils/datetime';
import {Currencies, formatCurrency} from 'utils/currency';
import {
  QuotationItem,
  QuotationItemRecord,
  QuotationView,
} from 'models/quotation';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {DiscountType} from 'models/invoice';
import {formatAddressFullname} from 'utils/utils';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';

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
      marginBottom: 20,
      alignItems: 'flex-start',
      position: 'absolute',
      top: 90,
    },
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
      flex: '0 0 43%',
    },
    tagContent: {
      fontSize: 10,
      color: '#616161',
      flex: '0 0 57%',
      textAlign: 'right',
      ...regularFontStyle,
    },
    dataBody: {
      borderBottom: '1px solid #212121',
    },
    contentHeader: {
      fontSize: 14,
      color: '#212121',
      ...boldFontStyle,
      marginTop: selectedLng === 'KA' ? 200 : 160,
    },
    contentBody: {
      color: '#616161',
      fontSize: 10,
      marginBottom: 10,
      lineHeight: 1.3,
      maxWidth: '100%',
    },
    notesSection: {
      marginTop: 1,
    },
    sectionHeading: {
      fontSize: 10,
      padding: 0,
      lineHeight: 0,
      marginBottom: 6,
      color: '#212121',
      ...boldFontStyle,
      marginTop: 15,
    },
    sectionBody: {
      fontSize: 10,
      color: '#616161',
      display: 'flex',
      flexDirection: 'column',
      paddingVertical: 1.5,
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
    signatureBox: {
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #E4E9F2',
      borderRadius: '8px',
      marginTop: 5,
      maxWidth: 270,
      height: 50,
      textAlign: 'center',
      justifyContent: 'space-around',
      position: 'relative',
    },
    signatureText: {
      position: 'absolute',
      bottom: -5,
      left: '22%',
      backgroundColor: 'white',
      padding: 1,
      ...boldFontStyle,
    },
  });

type Props = {
  translate: (key: string) => string;
  userInfo?: UserAccount | undefined;
  logoSrc?: string;
  currentCurrency?: Currency;
  serviceOrder?: ServiceOrderView;
  logoDimensions?: {
    width: number;
    height: number;
  } | null;
  quotation?: QuotationView;
  selectedLng?: string;
};

const QuotationPdfTemplate = React.memo(
  ({
    translate,
    userInfo,
    logoSrc,
    currentCurrency,
    serviceOrder,
    logoDimensions,
    quotation,
    selectedLng,
  }: Props) => {
    const articleItems = quotation?.items!;
    const calculateTotal = (arr: QuotationItemRecord[]) => {
      const sum = 0;

      return arr
        ?.map(
          (arrayItem) =>
            arrayItem.quantity *
            (arrayItem.unitAmount.netAmount /
              10 ** Currencies[arrayItem.unitAmount.currency] ??
              (currentCurrency && currentCurrency.code)),
        )
        .reduce((prevValue, currentValue) => prevValue + currentValue, sum);
    };

    const calculateTotalVAT = (items: QuotationItem[]) => {
      const vatMap = new Map();
      items.forEach((item) => {
        const {percentageVat, netAmount, fractionDigits} = item.unitAmount;
        const vat =
          (percentageVat / 100) *
          ((netAmount * item.quantity) / 10 ** (fractionDigits || 0) -
            (item.additionalInfo.discount?.amount?.value ?? 0) /
              10 ** (fractionDigits || 0));
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

    const netTotal = (articleItem: QuotationItem) => {
      const grossTotal =
        (articleItem.unitAmount?.netAmount ?? 0) * articleItem.quantity;
      const discountValue =
        articleItem?.additionalInfo?.discount?.amount?.value ?? 0;

      return (
        (grossTotal - discountValue) /
          10 ** articleItem.unitAmount.fractionDigits ?? 2
      );
    };

    const totalDiscount = (items: QuotationItem[]) =>
      items.reduce((total, item) => {
        const discountAmount =
          item.additionalInfo?.discount?.amount?.value || 0;
        const conversionFactor =
          Currencies[item.additionalInfo?.discount?.amount?.currency!] || 2;
        return total + discountAmount / 10 ** conversionFactor;
      }, 0);

    const boldFontStyle = {
      fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
    };

    const regularFontStyle = {
      fontFamily:
        selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
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
              <PdfTemplateLeftAddress
                companyName={userInfo?.serviceCompany?.name}
                billingAddressName={
                  userInfo?.serviceCompany?.billingAddress?.fullName
                }
                receiverName={quotation?.propertyOwner?.name}
                addressComponent={
                  quotation?.propertyOwner?.billingAddress?.component
                }
                selectedLng={selectedLng}
              />

              <View style={styles.rightAddress}>
                {quotation?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Quotation no.')}</Text>
                    <Text style={styles.tagContent}>
                      {quotation?.externalId}
                    </Text>
                  </View>
                )}

                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}>{translate('Quotation date')}</Text>
                  <Text style={styles.tagContent}>
                    {formatDate(quotation?.meta.createdAt) || '-'}
                  </Text>
                </View>

                {(quotation?.meta.creator?.firstName ||
                  quotation?.meta.creator?.lastName) && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Generated by')}</Text>
                    <Text style={styles.tagContent}>
                      {quotation?.meta.creator?.firstName}{' '}
                      {quotation?.meta.creator?.lastName}
                    </Text>
                  </View>
                )}

                {quotation?.propertyOwner?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Customer no.')}</Text>
                    <Text style={styles.tagContent}>
                      {quotation?.propertyOwner?.externalId}
                    </Text>
                  </View>
                )}

                {serviceOrder?.meta.createdAt && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Valid until')}</Text>
                    <Text style={styles.tagContent}>
                      {formatDate(serviceOrder?.meta.createdAt)}
                    </Text>
                  </View>
                )}

                <View style={{marginTop: 20}}>
                  {quotation?.elevator?.externalId && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}>{translate('Unit no.')}</Text>
                      <Text style={styles.tagContent}>
                        {quotation?.elevator?.externalId}
                      </Text>
                    </View>
                  )}

                  {quotation?.elevator?.address?.fullName && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}>
                        {translate('Unit address')}
                      </Text>
                      <Text style={styles.tagContent}>{`${
                        formatAddressFullname(quotation?.elevator?.address)
                          ?.fullCityName
                      }`}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View>
              <Text style={styles.contentHeader}>
                {translate('Quotation')} {quotation?.externalId}
              </Text>

              {serviceOrder?.description.trim() !== '' && (
                <Text style={styles.contentBody}>{quotation?.description}</Text>
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
                      {translate('ARTICLE NAME')}
                    </Text>

                    <Text
                      style={{
                        width: '10%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {translate('QUANTITY')}
                    </Text>
                    <Text
                      style={{
                        width: '8%',
                        textAlign: 'center',
                        marginLeft: 10,
                        ...styles.tableHeading,
                      }}>
                      {translate('UNIT')}
                    </Text>
                    <Text
                      style={{
                        width: '15%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {`${translate('PRICE')} (${currentCurrency?.symbol})`}
                    </Text>
                    <Text
                      style={{
                        width: '10%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {translate('DISCOUNT')}
                    </Text>
                    <Text
                      style={{
                        width: '15%',
                        textAlign: 'right',
                        ...styles.tableHeading,
                      }}>
                      {' '}
                      {`${translate('TOTAL')} (${currentCurrency?.symbol})`}
                    </Text>
                  </View>
                </View>

                {quotation?.items?.length! > 0 && (
                  <View style={styles.dataBody}>
                    {quotation?.items?.map((articleItem, index) => (
                      <View key={`${articleItem.id} - ${index}`}>
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
                              width: '40%',
                              textAlign: 'left',
                              color: '#212121',
                            }}>
                            {articleItem.name || '-'}
                          </Text>

                          <Text
                            style={{
                              width: '10%',
                              textAlign: 'right',
                              color: '#212121',
                            }}>
                            {articleItem.quantity || '-'}
                          </Text>
                          <Text
                            style={{
                              width: '8%',
                              textAlign: 'center',
                              marginLeft: 10,
                              color: '#212121',
                            }}>
                            {articleItem.article.unit || '-'}
                          </Text>
                          <Text
                            style={{
                              width: '15%',
                              textAlign: 'right',
                              color: '#212121',
                            }}>
                            {formatCurrency(
                              (articleItem?.unitAmount?.netAmount ?? 0) /
                                10 ** articleItem.unitAmount.fractionDigits ??
                                0,
                              {
                                currency: currentCurrency?.code,
                                excludeCurrencySymbol: true,
                                currencySymbol: currentCurrency?.symbol,
                                companyLang: selectedLng,
                              },
                            )}
                          </Text>
                          {articleItem?.additionalInfo?.discount?.percentage !==
                            0 ||
                          articleItem?.additionalInfo?.discount?.amount
                            ?.value !== 0 ? (
                            <Text
                              style={{
                                width: '10%',
                                textAlign: 'right',
                                color: '#212121',
                              }}>
                              -
                              {articleItem.additionalInfo.discount?.type ===
                              DiscountType.PERCENTAGE
                                ? articleItem?.additionalInfo?.discount
                                    ?.percentage
                                : (articleItem?.additionalInfo?.discount?.amount
                                    ?.value || 0) /
                                  10 ** 2}
                              {articleItem.additionalInfo.discount?.type ===
                              DiscountType.AMOUNT
                                ? currentCurrency?.symbol
                                : '%'}
                            </Text>
                          ) : (
                            <Text
                              style={{
                                width: '10%',
                                textAlign: 'right',
                                color: '#212121',
                              }}>
                              -
                            </Text>
                          )}
                          <Text
                            style={{
                              width: '15%',
                              textAlign: 'right',
                              color: '#212121',
                            }}>
                            {formatCurrency(netTotal(articleItem), {
                              currency: currentCurrency?.code,
                              excludeCurrencySymbol: true,
                              currencySymbol: currentCurrency?.symbol,
                              companyLang: selectedLng,
                            })}
                          </Text>
                        </View>
                        {articleItem?.description.trim() && (
                          <Text style={styles.descriptionText}>
                            {articleItem?.description}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {quotation?.items.length! > 0 && (
                  <View>
                    {totalDiscount(quotation?.items!) && (
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
                            currentCurrency?.symbol
                          })`}
                        </Text>
                        <Text
                          style={{
                            width: '24%',
                            textAlign: 'right',
                            fontSize: 10,
                          }}>
                          -
                          {formatCurrency(totalDiscount(quotation?.items!), {
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
                        {formatCurrency(
                          calculateTotal(articleItems) -
                            totalDiscount(articleItems),
                          {
                            currency: currentCurrency?.code,
                            excludeCurrencySymbol: true,
                            currencySymbol: currentCurrency?.symbol,
                            companyLang: selectedLng,
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
                            ) -
                            totalDiscount(quotation?.items!),
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

              {quotation?.additionalInfo?.paymentTerms?.trim() && (
                <View style={styles.notesSection}>
                  <Text style={styles.sectionHeading}>
                    {translate('Payment terms')}{' '}
                  </Text>
                  <Text>{quotation?.additionalInfo?.paymentTerms}</Text>
                </View>
              )}

              {quotation?.additionalInfo?.notes?.trim() && (
                <View>
                  <Text style={styles.sectionHeading}>
                    {translate('Notes')}
                  </Text>
                  <Text>{quotation?.additionalInfo?.notes}</Text>
                </View>
              )}

              <View>
                <Text style={styles.sectionHeading}>
                  {translate('Hereby I confirm the quotation')}{' '}
                </Text>

                <View style={styles.signatureBox}>
                  <View style={styles.signatureText}>
                    <Text>{translate('Date, place, signature, stamp')}</Text>
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

export default QuotationPdfTemplate;
