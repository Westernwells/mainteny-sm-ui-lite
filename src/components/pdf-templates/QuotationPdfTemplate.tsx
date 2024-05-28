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
import {formatCurrency} from 'utils/currency';
import {QuotationItem, QuotationView} from 'models/quotation';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {HtmlPDF} from 'components/HtmlPDF';
import {DiscountType} from 'models/invoice';
import {fixRounding, formatAddressFullname} from 'utils/utils';
import {calculateQuotationTotalWithPerItemDiscount} from 'utils/quotation';
import {
  applyGlobalDiscountOnQuotationItems,
  applyPerItemDiscountOnQuotationItems,
  applyQuotationDiscount,
  getDiscoutObj,
  getQuotationAggregatedItemsVats,
} from 'pages/QuotationDetails/utils';
import {calculateSameVatTotals} from 'utils/calculate-total';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import MontserratItalic from '../../assets/fonts/Montserrat/Montserrat-Italic.ttf';
import MontserratBoldItalic from '../../assets/fonts/Montserrat/Montserrat-BoldItalic.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';

Font.register({
  family: 'Montserrat-Regular',
  fonts: [
    {src: MontserratRegular},
    {src: MontserratBold, fontWeight: 'bold'},
    {src: MontserratItalic, fontStyle: 'italic'},
    {
      src: MontserratBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
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
      marginTop: 5,
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
      fontSize: 9,
      color: '#212121',
      flex: '0 0 43%',
    },
    tagContent: {
      fontSize: 9,
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
      marginBottom: 10,
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
      textTransform: 'uppercase',
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
    signatureBoxWrap: {
      marginTop: 30,
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
      left: '16%',
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
    const articleItems = quotation?.items.map((item) => ({
      ...item,
      discount: getDiscoutObj(item.additionalInfo.discount),
    }))!;

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

    const discount = getDiscoutObj(quotation?.additionalInfo?.discount);
    const discountType = discount?.type;
    const discountAmount = discount?.amount;
    const discountPercentage = discount?.percentage;
    const discountValue = discountAmount?.value ?? 0;

    const subtotalExclVat =
      calculateQuotationTotalWithPerItemDiscount(articleItems);

    const subtotalExclVatFormatted = formatCurrency(
      subtotalExclVat - discountValue,
      {
        currency: currentCurrency?.code,
        excludeCurrencySymbol: true,
        currencySymbol: currentCurrency?.symbol,
        companyLang: selectedLng,
      },
    );

    const subtotalExclVatAfterDiscount = applyQuotationDiscount({
      actualValue: subtotalExclVat,
      ...(discountType === DiscountType.AMOUNT
        ? {amount: discountValue ?? 0}
        : {percentage: discountPercentage ?? 0}),
    });

    const itemsAfterPerItemDiscount =
      applyPerItemDiscountOnQuotationItems(articleItems);

    const itemsAfterGlobalDiscount = applyGlobalDiscountOnQuotationItems(
      itemsAfterPerItemDiscount,
      discount,
    );

    const allItemsHasSameVAT = itemsAfterGlobalDiscount.every(
      (item) =>
        item.unitAmount.percentageVat ===
        articleItems[0].unitAmount.percentageVat,
    );

    const percentageVats = itemsAfterGlobalDiscount.length
      ? allItemsHasSameVAT
        ? [
            {
              percentageVat:
                itemsAfterGlobalDiscount[0].unitAmount.percentageVat,
              vat:
                subtotalExclVatAfterDiscount *
                (itemsAfterGlobalDiscount[0].unitAmount.percentageVat / 100),
            },
          ]
        : getQuotationAggregatedItemsVats(itemsAfterGlobalDiscount)
      : [];

    const {total, totalVAT} = calculateSameVatTotals(itemsAfterGlobalDiscount);

    const allItemsHaveZeroDiscount = articleItems.every(
      (item) =>
        item?.additionalInfo?.discount?.amount?.value === 0 ||
        item?.additionalInfo?.discount?.percentage === 0,
    );

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
                  quotation?.additionalInfo?.billingAddress?.component
                }
                selectedLng={selectedLng}
                translate={translate}
                beneficiaryInfo={
                  quotation?.additionalInfo.beneficiaryAddress?.component
                }
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

              {quotation?.description.trim() !== '' && (
                <HtmlPDF
                  html={quotation?.description || ''}
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
                      {`${translate('Price')} (${currentCurrency?.symbol})`}
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
                      {`${translate('Total')} (${currentCurrency?.symbol})`}
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

                          {!allItemsHaveZeroDiscount && (
                            <Text
                              style={{
                                width: '10%',
                                textAlign: 'right',
                                color: '#212121',
                              }}>
                              {articleItem?.additionalInfo?.discount
                                ?.percentage !== 0 ||
                              articleItem?.additionalInfo?.discount?.amount
                                ?.value !== 0
                                ? '-'
                                : ''}
                              {articleItem?.additionalInfo?.discount?.type ===
                              DiscountType.PERCENTAGE
                                ? articleItem?.additionalInfo?.discount
                                    .percentage
                                : (articleItem?.additionalInfo?.discount?.amount
                                    ?.value || 0) /
                                  10 ** 2}
                              {articleItem?.additionalInfo?.discount?.type ===
                              DiscountType.AMOUNT
                                ? currentCurrency?.symbol
                                : '%'}
                            </Text>
                          )}

                          <Text
                            style={{
                              width: allItemsHaveZeroDiscount ? '25%' : '15%',
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
                      {subtotalExclVatFormatted}
                    </Text>
                  </View>

                  <View>
                    {allItemsHasSameVAT ? (
                      <View style={styles.tableRow}>
                        <Text style={{width: '44%'}} />
                        <Text
                          style={{
                            width: '32%',
                            color: '#616161',
                            fontSize: 10,
                            textAlign: 'right',
                          }}>
                          {translate('VAT')} {percentageVats[0].percentageVat}%
                        </Text>
                        <Text
                          style={{
                            width: '24%',
                            textAlign: 'right',
                            fontSize: 10,
                          }}>
                          {formatCurrency(totalVAT, {
                            currency: currentCurrency?.code,
                            excludeCurrencySymbol: true,
                            currencySymbol: currentCurrency?.symbol,
                            companyLang: selectedLng,
                          })}
                        </Text>
                      </View>
                    ) : (
                      percentageVats.map((v, index) => (
                        <View
                          style={styles.tableRow}
                          key={`${index}-${v.percentageVat}`}>
                          <Text style={{width: '44%'}} />

                          <Text
                            style={{
                              width: '32%',
                              color: '#616161',
                              fontSize: 10,
                              textAlign: 'right',
                            }}>
                            {translate('VAT')} {v.percentageVat}%
                          </Text>
                          <Text
                            style={{
                              width: '24%',
                              textAlign: 'right',
                              fontSize: 10,
                            }}>
                            {formatCurrency(fixRounding(v.vat, 2), {
                              currency: currentCurrency?.code,
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                              roundingMode: 'floor',
                              excludeCurrencySymbol: true,
                              companyLang: selectedLng,
                              currencySymbol: currentCurrency?.symbol,
                            })}
                          </Text>
                        </View>
                      ))
                    )}
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
                      {formatCurrency(total, {
                        currency: currentCurrency?.code,
                        excludeCurrencySymbol: true,
                        currencySymbol: currentCurrency?.symbol,
                        companyLang: selectedLng,
                      })}
                    </Text>
                  </View>
                </View>
              </View>

              {quotation?.additionalInfo?.paymentTerms?.trim() && (
                <View style={styles.notesSection}>
                  <Text style={styles.sectionHeading}>
                    {translate('Payment terms')}{' '}
                  </Text>
                  <HtmlPDF
                    html={quotation?.additionalInfo?.paymentTerms || ''}
                  />
                </View>
              )}

              {quotation?.additionalInfo?.notes?.trim() && (
                <View>
                  <Text style={styles.sectionHeading}>
                    {translate('Notes')}
                  </Text>
                  <HtmlPDF html={quotation?.additionalInfo?.notes || ''} />
                </View>
              )}

              <View wrap={false} style={styles.signatureBoxWrap}>
                <Text style={styles.sectionHeading}>
                  {translate('Hereby I confirm the quotation.')}{' '}
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
