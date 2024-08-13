import {Document, Text, View, StyleSheet, Font} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import React, {useMemo} from 'react';
import {formatDate} from 'utils/datetime';
import {centsToMoney, formatCurrency, getCurrencySymbol} from 'utils/currency';
import {QuotationItem, QuotationView} from 'models/quotation';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency, HeaderFooterInfoData} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {HtmlPDF} from 'components/HtmlPDF';
import {DiscountType} from 'models/invoice';
import {calculateQuotationTotalWithPerItemDiscount} from 'utils/quotation';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
import {calculateInvoiceAmount} from 'utils/calculate-total';
import {stripHtmlTags} from 'pages/InvoiceDetails/utils';
import {
  shouldDisplayDiscountDash,
  allItemsHaveZeroDiscount,
} from 'utils/discount';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import MontserratItalic from '../../assets/fonts/Montserrat/Montserrat-Italic.ttf';
import MontserratBoldItalic from '../../assets/fonts/Montserrat/Montserrat-BoldItalic.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import PdfBodyContainer from './containers/PdfBodyContainer';
import PdfPageContainer from './containers/PdfPageContainer';
import TopSectionContainer from './containers/TopSectionContainer';
import PdfPageTitleHtml from './containers/PdfPageTitleHtml';
import PdfUnitAddress from './containers/PdfUnitAddress';

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
  boldFontStyle?: {fontFamily: string},
  regularFontStyle?: {fontFamily: string},
) =>
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
      flex: '0 0 43%',
    },
    tagContent: {
      fontSize: 8.5,
      color: '#616161',
      flex: '0 0 57%',
      textAlign: 'right',
      ...regularFontStyle,
    },
    dataBody: {
      borderBottom: '1px solid #212121',
      paddingBottom: 10,
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
      alignItems: 'baseline',
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
  currentCurrency?: Currency;
  quotation?: QuotationView;
  selectedLng?: string;
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
};

const QuotationPdfTemplate = React.memo(
  ({
    translate,
    userInfo,
    currentCurrency,
    quotation,
    selectedLng,
    headerInfo,
    headerPath,
    footerInfo,
    footerPath,
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
    const discountAmount = discount?.amount;
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

    const {vats, amountAfterGlobalDiscountWithVAT} = useMemo(
      () =>
        calculateInvoiceAmount({
          items: articleItems,
          globalDiscount: discount,
        }),
      [articleItems, discount],
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
        <PdfPageContainer selectedLng={selectedLng}>
          <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

          <PdfBodyContainer>
            <TopSectionContainer>
              <PdfTemplateLeftAddress
                companyName={userInfo?.serviceCompany?.name}
                billingAddressName={
                  userInfo?.serviceCompany?.billingAddress?.fullName
                }
                receiverName={
                  quotation?.additionalInfo?.billingAddress?.component?.name ||
                  quotation?.propertyOwner?.name
                }
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

                {quotation?.additionalInfo.expiryDate && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Valid until')}</Text>
                    <Text style={styles.tagContent}>
                      {formatDate(quotation?.additionalInfo.expiryDate)}
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

                  <PdfUnitAddress
                    address={quotation?.elevator.address}
                    translate={translate}
                    selectedLng={selectedLng}
                  />
                </View>
              </View>
            </TopSectionContainer>

            <View>
              <PdfPageTitleHtml
                value={quotation?.subject}
                selectedLng={selectedLng}
              />

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
                          <HtmlPDF
                            html={articleItem.name || '-'}
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
                            {articleItem.quantity || '-'}
                          </Text>
                          <Text
                            style={{
                              width: '8%',
                              textAlign: 'center',
                              marginLeft: 10,
                              color: '#212121',
                            }}>
                            {translate(articleItem.article.unit) || '-'}
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

                          {!allItemsHaveZeroDiscount(articleItems) && (
                            <Text
                              style={{
                                width: '10%',
                                textAlign: 'right',
                                color: '#212121',
                              }}>
                              {shouldDisplayDiscountDash(articleItem)}
                              {articleItem?.additionalInfo?.discount?.type ===
                              DiscountType.PERCENTAGE
                                ? articleItem?.additionalInfo?.discount
                                    .percentage
                                : formatCurrency(
                                    centsToMoney(
                                      currentCurrency?.code!,
                                      articleItem?.additionalInfo?.discount
                                        ?.amount?.value,
                                    ),
                                    {
                                      currency: currentCurrency?.code,
                                      excludeCurrencySymbol: true,
                                      currencySymbol: currentCurrency?.symbol,
                                      companyLang: selectedLng,
                                      minimumFractionDigits:
                                        articleItem?.additionalInfo?.discount
                                          ?.amount?.value === 0
                                          ? 0
                                          : 2,
                                      maximumFractionDigits:
                                        articleItem?.additionalInfo?.discount
                                          ?.amount?.value === 0
                                          ? 0
                                          : 2,
                                    },
                                  )}
                              {articleItem?.additionalInfo?.discount?.type ===
                              DiscountType.AMOUNT
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
                            {formatCurrency(netTotal(articleItem), {
                              currency: currentCurrency?.code,
                              excludeCurrencySymbol: true,
                              currencySymbol: currentCurrency?.symbol,
                              companyLang: selectedLng,
                            })}
                          </Text>
                        </View>
                        {articleItem?.description.trim() && (
                          <HtmlPDF
                            html={articleItem.description || '-'}
                            rootStyle={styles.descriptionText}
                          />
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
                      {subtotalExclVatFormatted}
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

              {quotation?.additionalInfo?.notes &&
                stripHtmlTags(quotation?.additionalInfo?.notes) && (
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

export default QuotationPdfTemplate;
