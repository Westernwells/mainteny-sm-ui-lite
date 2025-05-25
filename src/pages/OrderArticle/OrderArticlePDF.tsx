import {Document, StyleSheet, Text, View} from '@react-pdf/renderer';
import {ArticleOrderView} from 'models/article';
import {UserAccount} from 'models/user';
import React from 'react';
import {formatCurrency} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency, HeaderFooterInfoData} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {HtmlPDF} from 'components/HtmlPDF';
import PdfPageTitle from 'components/pdf-templates/containers/PdfPageTitle';
import PdfBodyContainer from 'components/pdf-templates/containers/PdfBodyContainer';
import PdfPageContainer from 'components/pdf-templates/containers/PdfPageContainer';
import TopSectionContainer from 'components/pdf-templates/containers/TopSectionContainer';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import {ServiceCompanyItem} from 'models/service-company';
import {isSwissAddress} from 'utils/address';
import {
  calculateTotal,
  calculateTotalVAT,
  convertToArticleOrderItemRecord,
} from './utils';

type StyleProps = {
  isSwissOffset?: boolean;
} & PdfConfigurationStyles;

const getStyles = ({
  boldFontStyle,
  regularFontStyle,
  primaryColor,
  secondaryColor,
  isSwissOffset = false,
}: StyleProps) =>
  StyleSheet.create({
    rightAddress: {
      flex: '0 0 42%',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '20px',
      ...(isSwissOffset && {
        paddingTop: '50px', // make offset be about 55mm
        paddingLeft: '6px', // make offset be about 22mm
      }),
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
      color: primaryColor,
      width: '43%',
    },
    tagContent: {
      fontSize: 10,
      color: secondaryColor,
      width: '57%',
      textAlign: 'right',
      ...regularFontStyle,
    },
    dataBody: {
      borderBottom: '1px solid #212121',
      paddingBottom: 1,
    },
    contentBody: {
      marginBottom: 10,
      paddingTop: 25,
      maxWidth: '95%',
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
      color: primaryColor,
      fontWeight: 'extrabold',
    },
    sectionBody: {
      fontSize: 10,
      fontWeight: 'light',
      color: secondaryColor,
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
      color: secondaryColor,
      display: 'flex',
      fontSize: 6,
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
      fontSize: 8.5,
      color: primaryColor,
      paddingLeft: 20,
      letterSpacing: -0.15,
      marginTop: 2,
      lineHeight: 1.3,
    },
  });

type Props = {
  serviceCompany?: ServiceCompanyItem;
  translate: (key: string) => string;
  articleOrder?: ArticleOrderView | undefined;
  currentCurrency?: Currency;
  selectedLng?: string;
  userInfo?: UserAccount | undefined;
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const OrderArticlePDF = React.memo(
  ({
    serviceCompany,
    articleOrder,
    userInfo,
    currentCurrency,
    selectedLng,
    translate,
    headerInfo,
    headerPath,
    footerInfo,
    footerPath,
    fontStyles,
    primaryColor,
    secondaryColor,
  }: Props) => {
    const articleItems = convertToArticleOrderItemRecord(articleOrder?.items!);

    const totalVATMap = calculateTotalVAT(articleItems);

    const uniqueVATPercentages = [
      ...new Set(
        articleItems?.map((item) => item.unitPurchaseAmount?.percentageVat),
      ),
    ];

    const serviceCompanyInfo = getServiceCompanyInfo(userInfo);

    const styles = getStyles({
      boldFontStyle: fontStyles.bold,
      regularFontStyle: fontStyles.regular,
      primaryColor,
      secondaryColor,
      isSwissOffset: isSwissAddress(serviceCompany?.businessAddress),
    });

    return (
      <Document>
        <PdfPageContainer fontStyles={fontStyles} primaryColor={primaryColor}>
          <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

          <PdfBodyContainer>
            <TopSectionContainer>
              <PdfTemplateLeftAddress
                serviceCompany={serviceCompany}
                serviceCompanyInfo={serviceCompanyInfo}
                fallbackReceiverName={articleOrder?.articleSupplier?.name}
                addressComponent={
                  articleOrder?.articleSupplier?.address?.component
                }
                translate={translate}
                fontStyles={fontStyles}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />

              <View style={styles.rightAddress}>
                {articleOrder?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Order no.')}</Text>
                    <Text style={styles.tagContent}>
                      {articleOrder?.externalId || '-'}
                    </Text>
                  </View>
                )}

                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}>{translate('Order date')}</Text>
                  <Text style={styles.tagContent}>
                    {formatDate(articleOrder?.meta.createdAt) || '-'}
                  </Text>
                </View>

                {(articleOrder?.meta.creator?.firstName ||
                  articleOrder?.meta.creator?.lastName) && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Generated by')}</Text>
                    <Text style={styles.tagContent}>
                      {articleOrder?.meta.creator?.firstName}{' '}
                      {articleOrder?.meta.creator?.lastName}
                    </Text>
                  </View>
                )}

                {articleOrder?.articleSupplier?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Supplier no.')}</Text>
                    <Text style={styles.tagContent}>
                      {articleOrder?.articleSupplier?.externalId || '-'}{' '}
                    </Text>
                  </View>
                )}
              </View>
            </TopSectionContainer>

            <View>
              <PdfPageTitle fontStyles={fontStyles} primaryColor={primaryColor}>
                {translate('Article Order for')} {articleOrder?.externalId}
              </PdfPageTitle>

              <HtmlPDF
                html={articleOrder?.description || ''}
                rootStyle={styles.contentBody}
                fontStyles={fontStyles}
              />

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
                  {articleOrder?.items.map((articleOrderItem, index) => (
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
                          html={articleOrderItem.articleName || '-'}
                          rootStyle={{
                            width: '43%',
                            textAlign: 'left',
                            color: '#212121',
                          }}
                          fontStyles={fontStyles}
                        />
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
                          {translate(articleOrderItem.unit) || '-'}
                        </Text>
                        <Text
                          style={{
                            width: '13%',
                            textAlign: 'right',
                            color: '#212121',
                          }}>
                          {formatCurrency(
                            (articleOrderItem.article?.unitPurchaseAmount
                              ?.netAmount ?? 0) /
                              10 **
                                (articleOrderItem.article.unitPurchaseAmount
                                  ?.fractionDigits ?? 2),
                            {
                              currency: currentCurrency?.code,
                              excludeCurrencySymbol: true,
                              currencySymbol: currentCurrency?.symbol,
                              companyLang: selectedLng,
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
                            ((articleOrderItem.article?.unitPurchaseAmount
                              ?.netAmount ?? 0) *
                              articleOrderItem.quantity) /
                              10 **
                                (articleOrderItem.article.unitPurchaseAmount
                                  ?.fractionDigits ?? 2),
                            {
                              currency: currentCurrency?.code,
                              excludeCurrencySymbol: true,
                              currencySymbol: currentCurrency?.symbol,
                              companyLang: selectedLng,
                            },
                          )}
                        </Text>
                      </View>
                      {articleOrderItem?.description.trim() !== '' && (
                        <HtmlPDF
                          html={articleOrderItem?.description}
                          rootStyle={styles.descriptionText}
                          fontStyles={fontStyles}
                        />
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
                        calculateTotal(articleItems, currentCurrency?.code),
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
                    {uniqueVATPercentages?.map((vatPercentage) => (
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
                            companyLang: selectedLng,
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
                        ...fontStyles.bold,
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
                        ...fontStyles.bold,
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
              </View>
            </View>
          </PdfBodyContainer>

          <PdfTemplateFooter
            userInfo={userInfo}
            translate={translate}
            footerInfo={footerInfo}
            footerPath={footerPath}
            fontStyles={fontStyles}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </PdfPageContainer>
      </Document>
    );
  },
);

export default OrderArticlePDF;
