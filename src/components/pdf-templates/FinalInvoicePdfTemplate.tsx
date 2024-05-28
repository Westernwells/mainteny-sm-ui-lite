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
import {centsToMoney, formatCurrency} from 'utils/currency';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {DiscountType, InvoiceItem, InvoiceView} from 'models/invoice';
import {fixRounding, formatCostText} from 'utils/utils';
import {
  calculateSameVatTotals,
  calculateTotalWithPerItemDiscount,
} from 'utils/calculate-total';
import {
  applyDiscount,
  applyGlobalDiscountOnItems,
  applyPerItemDiscountOnItems,
  getAggregatedItemsVats,
} from 'pages/InvoiceDetails/utils';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
import {ArticleType} from 'models/article';
import useCalculateLaborMaterialCost from 'hooks/useCalculateLaborMaterialCost';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianRegular from '../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import PdfTemplateInvoiceDetails from './PdfTemplateInvoiceDetails';
import PdfPartialPaymentSection from './PdfPartialPaymentSection';

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
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 40,
      alignItems: 'flex-start',
      marginTop: 5,
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
    contentBody: {
      color: '#616161',
      fontSize: 10,
      marginVertical: 15,
      lineHeight: 1.3,
      maxWidth: '100%',
    },
    notesSection: {
      marginTop: 5,
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
      marginVertical: 4,
    },
    tableRow: {
      display: 'flex',
      flexDirection: 'row',
      fontSize: 10,
      marginVertical: 4,
    },
    descriptionText: {
      width: '37%',
      display: 'flex',
      fontSize: 8.5,
      color: '#212121',
      paddingLeft: 20,
      letterSpacing: -0.15,
      marginTop: 2,
      lineHeight: 1.5,
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
  logoDimensions?: {
    width: number;
    height: number;
  } | null;
  invoice: InvoiceView;
  previousInvoices: InvoiceView[];
  selectedLng?: string;
};

type ArticleSectionProps = {
  translate: (key: string) => string;
  currentCurrency?: Currency;
  invoice: InvoiceView;
  allItemsHaveZeroDiscount: boolean;
  discountValue: number;
  subtotalExclVatFormatted: string;
  allItemsHasSameVAT: boolean;
  percentageVats: {
    percentageVat: number;
    vat: number;
  }[];
  totalVAT: number;
  total: number;
  selectedLng?: string;
  netTotal: (articleItem: InvoiceItem) => number;
};

const TableHeading = ({
  text,
  width,
  textAlign,
  marginLeft,
}: {
  text: string;
  width: string;
  textAlign: 'left' | 'right' | 'center' | 'justify' | undefined;
  marginLeft?: number;
}) => (
  <Text
    style={{
      width,
      textAlign,
      marginLeft,
      fontSize: 6,
      textTransform: 'uppercase',
    }}>
    {text}
  </Text>
);

export const ArticleSection = ({
  invoice,
  currentCurrency,
  translate,
  allItemsHaveZeroDiscount,
  discountValue,
  subtotalExclVatFormatted,
  allItemsHasSameVAT,
  percentageVats,
  totalVAT,
  total,
  selectedLng,
  netTotal,
}: ArticleSectionProps) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const regularFontStyle = {
    fontFamily:
      selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
  };

  const styles = getStyles(boldFontStyle, regularFontStyle);
  return (
    <View style={styles.table} wrap={false}>
      <View style={styles.tableHead}>
        <View style={{...styles.tableRow, width: '100%'}}>
          <TableHeading text="#" width="2%" textAlign="left" />
          <TableHeading
            text={translate('Article Name')}
            width="37%"
            textAlign="left"
            marginLeft={10}
          />
          <TableHeading
            text={translate('Quantity')}
            width="10%"
            textAlign="center"
          />
          <TableHeading
            text={translate('Unit')}
            width="8%"
            textAlign="center"
          />
          <TableHeading
            text={`${translate('Price')} (${currentCurrency?.symbol})`}
            width="15%"
            textAlign="right"
            marginLeft={5}
          />
          {!allItemsHaveZeroDiscount && (
            <TableHeading
              text={translate('Discount')}
              width="13%"
              textAlign="right"
            />
          )}
          <TableHeading
            text={`${translate('Total')} (${currentCurrency?.symbol})`}
            width={allItemsHaveZeroDiscount ? '28%' : '15%'}
            textAlign="right"
          />
        </View>
      </View>

      {invoice.items.length > 0 && (
        <View style={styles.dataBody}>
          {invoice.items?.map((articleItem, index) => (
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
                  style={{width: '37%', textAlign: 'left', color: '#212121'}}>
                  {articleItem.name || '-'}
                </Text>
                <Text
                  style={{
                    width: '10%',
                    textAlign: 'center',
                    color: '#212121',
                  }}>
                  {articleItem.quantity || '-'}
                </Text>
                <Text
                  style={{
                    width: '8%',
                    textAlign: 'center',
                    color: '#212121',
                  }}>
                  {translate(articleItem?.article?.unit!) || '-'}
                </Text>
                <Text
                  style={{
                    width: '15%',
                    textAlign: 'right',
                    color: '#212121',
                  }}>
                  {formatCurrency(
                    centsToMoney(
                      currentCurrency?.code!,
                      articleItem?.unitAmount?.netAmount,
                    ) ?? 0,
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
                      width: '13%',
                      textAlign: 'right',
                      color: '#212121',
                    }}>
                    {articleItem?.additionalInfo?.discount?.percentage !== 0 ||
                    articleItem?.additionalInfo?.discount?.amount?.value !== 0
                      ? '-'
                      : ''}
                    {articleItem?.additionalInfo?.discount?.type ===
                    DiscountType.PERCENTAGE
                      ? articleItem?.additionalInfo?.discount.percentage
                      : formatCurrency(
                          centsToMoney(
                            currentCurrency?.code!,
                            articleItem?.additionalInfo?.discount?.amount
                              ?.value,
                          ),
                          {
                            currency: currentCurrency?.code,
                            excludeCurrencySymbol: true,
                            currencySymbol: currentCurrency?.symbol,
                            companyLang: selectedLng,
                            minimumFractionDigits:
                              articleItem?.additionalInfo?.discount?.amount
                                ?.value === 0
                                ? 0
                                : 2,
                            maximumFractionDigits:
                              articleItem?.additionalInfo?.discount?.amount
                                ?.value === 0
                                ? 0
                                : 2,
                          },
                        )}
                    {articleItem?.additionalInfo?.discount?.type ===
                    DiscountType.AMOUNT
                      ? currentCurrency?.symbol
                      : '%'}
                  </Text>
                )}
                <Text
                  style={{
                    width: allItemsHaveZeroDiscount ? '28%' : '15%',
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
              }}>{`${translate('Discount')} (${
              currentCurrency?.symbol
            })`}</Text>
            <Text style={{width: '24%', textAlign: 'right', fontSize: 10}}>
              {discountValue > 0 ? '-' : ''}
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
          <Text style={{width: '24%', textAlign: 'right', fontSize: 10}}>
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
                }}>{`${translate('VAT')} ${
                percentageVats[0].percentageVat
              }%`}</Text>
              <Text style={{width: '24%', textAlign: 'right', fontSize: 10}}>
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
              <View style={styles.tableRow} key={`${index}-${v.percentageVat}`}>
                <Text style={{width: '44%'}} />
                <Text
                  style={{
                    width: '32%',
                    color: '#616161',
                    fontSize: 10,
                    textAlign: 'right',
                  }}>{`${translate('VAT')} ${v.percentageVat}%`}</Text>
                <Text style={{width: '24%', textAlign: 'right', fontSize: 10}}>
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
            }}>{`${translate('Total incl. VAT')} (${
            currentCurrency?.symbol
          })`}</Text>
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
  );
};

const FinalInvoicePdfTemplate = React.memo(
  ({
    translate,
    userInfo,
    logoSrc,
    currentCurrency,
    logoDimensions,
    invoice,
    selectedLng,
    previousInvoices,
  }: Props) => {
    const articleItems = invoice?.items.map((item) => ({
      ...item,
      discount: getDiscoutObj(item?.additionalInfo?.discount),
    }));

    const subtotalExclVat = calculateTotalWithPerItemDiscount(articleItems);

    const subtotalExclVatFormatted = formatCurrency(subtotalExclVat, {
      currency: currentCurrency?.code,
      excludeCurrencySymbol: true,
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
    });

    const subtotalExclVatAfterDiscount = applyDiscount({
      actualValue: subtotalExclVat,
      ...(invoice.additionalInfo.discount?.type === DiscountType.AMOUNT
        ? {amount: invoice.additionalInfo.discount?.amount?.value ?? 0}
        : {percentage: invoice.additionalInfo.discount?.percentage ?? 0}),
    });

    const itemsAfterPerItemDiscount = applyPerItemDiscountOnItems(articleItems);

    const itemsAfterGlobalDiscount = applyGlobalDiscountOnItems(
      itemsAfterPerItemDiscount,
      invoice.additionalInfo.discount,
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
        : getAggregatedItemsVats(itemsAfterGlobalDiscount)
      : [];

    const discount = getDiscoutObj(invoice?.additionalInfo?.discount);
    const discountAmount = discount?.amount;
    const discountValue = discountAmount?.value ?? 0;

    const netTotal = (articleItem: InvoiceItem) => {
      const grossTotal =
        (articleItem.unitAmount?.netAmount ?? 0) * articleItem.quantity;
      const itemDiscountValue =
        articleItem?.additionalInfo?.discount?.amount?.value ?? 0;

      return (
        (grossTotal - itemDiscountValue) /
          10 ** articleItem.unitAmount.fractionDigits ?? 2
      );
    };

    const allItemsHaveZeroDiscount = articleItems?.every(
      (item) =>
        item?.additionalInfo?.discount?.amount?.value === 0 ||
        item?.additionalInfo?.discount?.percentage === 0,
    );

    const {total, totalVAT} = calculateSameVatTotals(itemsAfterGlobalDiscount);

    const laborCost = useCalculateLaborMaterialCost(
      itemsAfterGlobalDiscount,
      ArticleType.LABOR,
      currentCurrency,
    );
    const materialCost = useCalculateLaborMaterialCost(
      itemsAfterGlobalDiscount,
      ArticleType.MATERIAL,
      currentCurrency,
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
                receiverName={invoice?.propertyOwner?.name}
                addressComponent={
                  invoice?.additionalInfo?.billingAddress?.component
                }
                beneficiaryInfo={
                  invoice?.additionalInfo.beneficiaryAddress?.component
                }
                selectedLng={selectedLng}
                translate={translate}
              />

              <PdfTemplateInvoiceDetails
                translate={translate}
                invoice={invoice}
                selectedLng={selectedLng}
              />
            </View>

            <View>
              <Text style={styles.contentHeader}>{invoice?.subject}</Text>
              {invoice?.description.trim() !== '' && (
                <Text style={styles.contentBody}>{invoice?.description}</Text>
              )}

              {invoice?.additionalInfo.showArticleSection && (
                <ArticleSection
                  invoice={invoice}
                  currentCurrency={currentCurrency}
                  translate={translate}
                  allItemsHaveZeroDiscount={allItemsHaveZeroDiscount}
                  discountValue={discountValue}
                  subtotalExclVatFormatted={subtotalExclVatFormatted}
                  allItemsHasSameVAT={allItemsHasSameVAT}
                  percentageVats={percentageVats}
                  totalVAT={totalVAT}
                  total={total}
                  selectedLng={selectedLng}
                  netTotal={netTotal}
                />
              )}

              <PdfPartialPaymentSection
                translate={translate}
                selectedLng={selectedLng}
                invoice={invoice}
                currentCurrency={currentCurrency}
                previousInvoices={previousInvoices}
                articleItems={articleItems}
              />

              {invoice?.additionalInfo?.moreInfo?.trim() && (
                <View wrap={false}>
                  <Text style={styles.sectionHeading}>
                    {translate('Notes')}
                  </Text>
                  <Text>
                    {formatCostText(
                      invoice?.additionalInfo?.moreInfo,
                      `${formatCurrency(laborCost, {
                        currency: currentCurrency?.code,
                        currencySymbol: currentCurrency?.symbol,
                        companyLang: selectedLng,
                      })}`,
                      `${formatCurrency(materialCost, {
                        currency: currentCurrency?.code,
                        currencySymbol: currentCurrency?.symbol,
                        companyLang: selectedLng,
                      })}`,
                    )}
                  </Text>
                </View>
              )}
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

export default FinalInvoicePdfTemplate;
