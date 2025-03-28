import {Document, Font, StyleSheet, Text, View} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import React, {useMemo} from 'react';
import {formatDate} from 'utils/datetime';
import {centsToMoney, formatCurrency, getCurrencySymbol} from 'utils/currency';
import {EditableQuotationItem, QuotationView} from 'models/quotation';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency, HeaderFooterInfoData} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {HtmlPDF} from 'components/HtmlPDF';
import {calculateArticlesAmount} from 'utils/calculate-total';
import {stripHtmlTags} from 'pages/InvoiceDetails/utils';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {getAddressComponentFromQuotation} from 'utils/pdfTemplates';
import {toSentenceCase} from 'utils/string';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
import {
  getDiscountDisplay,
  getQuotationItemTotalAfterPerItemDiscount,
} from 'utils/quotation';
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
import AlternativeAddressTemplate from './AlternativeAddressTemplate';
import PdfPageTitle from './containers/PdfPageTitle';

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
    subPositionRow: {
      display: 'flex',
      flexDirection: 'row',
      fontSize: 10,
      marginVertical: 4,
      alignItems: 'flex-start',
    },
    dataBody: {
      borderBottom: '1px solid #212121',
      paddingBottom: 10,
    },
    paymentTermsSection: {
      marginTop: 1,
    },
    notesSection: {
      marginTop: 30,
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
      flexDirection: 'row',
      fontSize: 10,
      marginVertical: 3,
    },
    descriptionText: {
      display: 'flex',
      fontSize: 8.5,
      color: '#212121',
      paddingLeft: 23,
      letterSpacing: -0.15,
      marginVertical: 4,
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
    col2Left: {
      width: '5%',
      textAlign: 'left',
      color: '#212121',
    },
    col40Left: {
      width: '37%',
      textAlign: 'left',
      color: '#212121',
      display: 'flex',
      flexDirection: 'row',
    },
    col10Right: {
      width: '10%',
      textAlign: 'right',
      color: '#212121',
    },
    col8Center: {
      width: '8%',
      textAlign: 'center',
      marginLeft: 10,
      color: '#212121',
    },
    col15Right: {
      width: '15%',
      textAlign: 'right',
      color: '#212121',
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      fontSize: 10,
      marginVertical: 3,
      color: '#616161',
    },
    subPositionCol2Left: {
      width: '5%',
      textAlign: 'left',
      color: '#212121',
    },
    subPositionNameContainer: {
      width: '37%',
      display: 'flex',
      flexDirection: 'row',
      color: '#212121',
    },
    subPositionText: {
      fontSize: 10,
      color: '#212121',
      display: 'flex',
      flexDirection: 'row',
    },
  });

type BaseProps = {
  translate: (key: string, options?: {context: string}) => string;
  userInfo?: UserAccount;
  currentCurrency?: Currency;
  quotation?: QuotationView;
  selectedLng?: string;
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
  pdfConfigClientStorage: ClientReportForPDFConfig;
  quotationItems: EditableQuotationItem[];
};

type JobOverviewProps = BaseProps & {
  isJobOverview: true;
  serviceOrderType: string;
};

type NonJobOverviewProps = BaseProps & {
  isJobOverview?: false;
  serviceOrderType?: string;
};
type Props = JobOverviewProps | NonJobOverviewProps;
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
    pdfConfigClientStorage,
    isJobOverview,
    serviceOrderType,
    quotationItems,
  }: Props) => {
    const discount = quotation?.additionalInfo?.discount;
    const discountAmount = discount?.amount;
    const discountValue = centsToMoney(
      currentCurrency?.code!,
      discountAmount?.value ?? 0,
    );

    const {amountAfterGlobalDiscount, amountAfterGlobalDiscountWithVAT, vats} =
      useMemo(
        () =>
          calculateArticlesAmount({
            items: quotationItems,
            globalDiscount: getDiscoutObj(
              quotation?.additionalInfo.discount,
              true,
            ),
          }),
        [quotationItems, quotation?.additionalInfo.discount],
      );

    const amountAfterGlobalDiscountFormatted = formatCurrency(
      amountAfterGlobalDiscount,
      {
        currency: currentCurrency?.code,
        excludeCurrencySymbol: true,
        currencySymbol: currentCurrency?.symbol,
        companyLang: selectedLng,
      },
    );

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
      quotation?.additionalInfo?.alternativeServiceCompanyInfo,
    );

    const boldFontStyle = {
      fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
    };

    const regularFontStyle = {
      fontFamily:
        selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
    };

    const styles = getStyles(boldFontStyle, regularFontStyle);

    const customerVATId =
      (pdfConfigClientStorage.includeCustomerVAT &&
        quotation?.propertyOwner?.additionalInfo?.vatId) ||
      '';

    const eanValue = quotation?.propertyOwner?.additionalInfo?.ean || '';

    const unitBuilding =
      (pdfConfigClientStorage.includeUnitBuilding &&
        quotation?.elevator?.additionalInfo?.buildingLocation) ||
      '';

    return (
      <Document>
        {quotation?.additionalInfo.alternativeAddress &&
          Object.keys(quotation?.additionalInfo.alternativeAddress!).length !==
            0 &&
          !!quotation?.additionalInfo.alternativeAddress.component?.name && (
            <AlternativeAddressTemplate
              userInfo={userInfo}
              selectedLng={selectedLng}
              translate={translate}
              headerInfo={headerInfo}
              headerPath={headerPath}
              footerInfo={footerInfo}
              footerPath={footerPath}
              alternativeServiceCompanyInfo={
                quotation?.additionalInfo.alternativeServiceCompanyInfo
              }
              alternativeAddress={quotation?.additionalInfo.alternativeAddress}
            />
          )}

        <PdfPageContainer selectedLng={selectedLng}>
          <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

          <PdfBodyContainer>
            <TopSectionContainer>
              <PdfTemplateLeftAddress
                serviceCompanyInfo={serviceCompanyInfo}
                fallbackReceiverName={quotation?.propertyOwner?.name}
                addressComponent={getAddressComponentFromQuotation(quotation)}
                selectedLng={selectedLng}
                translate={translate}
                beneficiaryInfo={
                  quotation?.additionalInfo.beneficiaryAddress?.component
                }
                customerVATId={customerVATId}
                eanValue={eanValue}
              />

              <View style={styles.rightAddress}>
                {!!quotation?.externalId && (
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
                    {formatDate(quotation?.additionalInfo.sentDate) ||
                      formatDate(new Date())}
                  </Text>
                </View>

                {!!(
                  pdfConfigClientStorage.includeUsername &&
                  (quotation?.meta.creator?.firstName ||
                    quotation?.meta.creator?.lastName ||
                    '')
                ) && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Generated by')}</Text>
                    <Text style={styles.tagContent}>
                      {quotation?.meta.creator?.firstName}{' '}
                      {quotation?.meta.creator?.lastName}
                    </Text>
                  </View>
                )}

                {!!(
                  userInfo?.contact?.phone &&
                  pdfConfigClientStorage.includeUserPhone
                ) && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Phone number')}</Text>
                    <Text style={styles.tagContent}>
                      {userInfo?.contact?.phone}
                    </Text>
                  </View>
                )}
                {!!(
                  userInfo?.contact?.email &&
                  pdfConfigClientStorage.includeUserEmail
                ) && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Email address')}</Text>
                    <Text style={styles.tagContent}>
                      {userInfo?.contact?.email}
                    </Text>
                  </View>
                )}
                {!!quotation?.propertyOwner?.externalId && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Customer no.')}</Text>
                    <Text style={styles.tagContent}>
                      {quotation?.propertyOwner?.externalId}
                    </Text>
                  </View>
                )}

                {!!quotation?.additionalInfo.expiryDate && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Valid until')}</Text>
                    <Text style={styles.tagContent}>
                      {formatDate(quotation?.additionalInfo.expiryDate)}
                    </Text>
                  </View>
                )}

                <View style={{marginTop: 20}}>
                  {!!(
                    pdfConfigClientStorage.includeUnitNumber &&
                    quotation?.elevator?.externalId
                  ) && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}>
                        {translate('Unit no.', {context: 'elevator'})}
                      </Text>
                      <Text style={styles.tagContent}>
                        {quotation?.elevator?.externalId}
                      </Text>
                    </View>
                  )}
                  {!!(
                    quotation?.elevator?.serialNumber &&
                    pdfConfigClientStorage.includeSerialNumber
                  ) && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}>
                        {translate('Serial number')}
                      </Text>
                      <Text style={styles.tagContent}>
                        {quotation?.elevator?.serialNumber || '-'}
                      </Text>
                    </View>
                  )}

                  <PdfUnitAddress
                    address={quotation?.elevator?.address}
                    translate={translate}
                    selectedLng={selectedLng}
                    building={unitBuilding}
                  />
                </View>
              </View>
            </TopSectionContainer>

            <View>
              {isJobOverview ? (
                <PdfPageTitle>
                  {translate('Job Confirmation:')}{' '}
                  {translate(toSentenceCase(serviceOrderType))}
                </PdfPageTitle>
              ) : (
                <View>
                  <PdfPageTitleHtml
                    value={quotation?.subject}
                    selectedLng={selectedLng}
                  />
                </View>
              )}

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

              <View
                style={{
                  marginBottom: 16,
                  paddingRight: 5,
                }}>
                <View>
                  <View style={styles.table}>
                    <View style={styles.tableHead}>
                      <View style={styles.tableRow}>
                        <Text style={[styles.col2Left, styles.tableHeading]}>
                          #
                        </Text>
                        <Text style={[styles.col40Left, styles.tableHeading]}>
                          {translate('Name')}
                        </Text>
                        <Text style={[styles.col10Right, styles.tableHeading]}>
                          {translate('Quantity')}
                        </Text>
                        <Text style={[styles.col8Center, styles.tableHeading]}>
                          {translate('Unit')}
                        </Text>
                        <Text style={[styles.col15Right, styles.tableHeading]}>
                          {`${translate('Price')} (${
                            getCurrencySymbol[currentCurrency?.code!]
                          })`}
                        </Text>
                        <Text style={[styles.col10Right, styles.tableHeading]}>
                          {translate('Discount')}
                        </Text>
                        <Text style={[styles.col15Right, styles.tableHeading]}>
                          {`${translate('Total')} (${
                            getCurrencySymbol[currentCurrency?.code!]
                          })`}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.dataBody}>
                      {quotationItems?.map((mainPosition, index) => {
                        const totalPriceExclVatAfterDiscount =
                          getQuotationItemTotalAfterPerItemDiscount({
                            positionItem: mainPosition,
                          });

                        return (
                          <View key={`${mainPosition.id}-${index}`}>
                            <View style={styles.tableRow}>
                              <Text style={styles.col2Left}>
                                {mainPosition.userSeqNumber || index + 1}
                              </Text>
                              <HtmlPDF
                                html={mainPosition.name || '-'}
                                rootStyle={styles.col40Left}
                              />
                              <Text style={styles.col10Right}>
                                {mainPosition?.quantity || '-'}
                              </Text>
                              <Text style={styles.col8Center}>
                                {translate(mainPosition?.article?.unit || '-')}
                              </Text>
                              <Text style={styles.col15Right}>
                                {formatCurrency(
                                  centsToMoney(
                                    currentCurrency?.code!,
                                    mainPosition?.unitAmount?.netAmount || 0,
                                  ),
                                  {
                                    currency: currentCurrency?.code,
                                    excludeCurrencySymbol: true,
                                    currencySymbol: currentCurrency?.symbol,
                                    companyLang: selectedLng,
                                  },
                                )}
                              </Text>
                              <Text style={styles.col10Right}>
                                {getDiscountDisplay(
                                  mainPosition.discount,
                                  currentCurrency,
                                  selectedLng,
                                )}
                              </Text>
                              <Text style={styles.col15Right}>
                                {formatCurrency(
                                  totalPriceExclVatAfterDiscount || 0,
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
                              {!!mainPosition.description?.trim() && (
                                <HtmlPDF
                                  html={mainPosition.description || '-'}
                                  rootStyle={{
                                    ...styles.descriptionText,
                                  }}
                                />
                              )}
                            </View>

                            {mainPosition.subItemsConfig?.subItemsVisible &&
                              mainPosition?.subItems?.map(
                                (subItem, subIndex) => (
                                  <View
                                    key={`${subItem?.id}-${index}-${subIndex}`}>
                                    <View style={styles.subPositionRow}>
                                      <Text style={styles.subPositionCol2Left}>
                                        {subItem.userSeqNumber ||
                                          `${index + 1}.${subIndex + 1}`}
                                      </Text>
                                      <HtmlPDF
                                        html={
                                          subItem?.name ||
                                          subItem?.article?.name ||
                                          '-'
                                        }
                                        rootStyle={{
                                          ...styles.subPositionNameContainer,
                                        }}
                                      />
                                      <Text style={styles.col10Right}>
                                        {subItem?.quantity || '-'}
                                      </Text>
                                      <Text style={styles.col8Center}>
                                        {translate(
                                          subItem?.article?.unit || '-',
                                        )}
                                      </Text>

                                      {mainPosition.subItemsConfig
                                        ?.priceVisible ? (
                                        <Text style={styles.col15Right}>
                                          {formatCurrency(
                                            centsToMoney(
                                              currentCurrency?.code!,
                                              subItem?.unitAmount?.netAmount ||
                                                0,
                                            ),
                                            {
                                              currency: currentCurrency?.code,
                                              excludeCurrencySymbol: true,
                                              currencySymbol:
                                                currentCurrency?.symbol,
                                              companyLang: selectedLng,
                                            },
                                          )}
                                        </Text>
                                      ) : (
                                        <Text style={styles.col15Right} />
                                      )}

                                      <Text style={styles.col10Right} />

                                      {mainPosition.subItemsConfig
                                        ?.priceVisible ? (
                                        <Text style={styles.col15Right}>
                                          {formatCurrency(
                                            centsToMoney(
                                              currentCurrency?.code!,
                                              (subItem.unitAmount?.netAmount ??
                                                0) * (subItem.quantity ?? 1) ||
                                                0,
                                            ),
                                            {
                                              currency: currentCurrency?.code,
                                              excludeCurrencySymbol: true,
                                              currencySymbol:
                                                currentCurrency?.symbol,
                                              companyLang: selectedLng,
                                            },
                                          )}
                                        </Text>
                                      ) : (
                                        <Text style={styles.col15Right} />
                                      )}
                                    </View>

                                    {!!subItem?.description?.trim() && (
                                      <HtmlPDF
                                        html={subItem?.description || '-'}
                                        rootStyle={{
                                          ...styles.descriptionText,
                                        }}
                                      />
                                    )}
                                  </View>
                                ),
                              )}
                          </View>
                        );
                      })}
                    </View>

                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                      }}>
                      <View style={styles.footerRow}>
                        <Text style={{width: '44%'}} />
                        <Text
                          style={{
                            width: '32%',
                            color: '#616161',
                            fontSize: 10,
                            textAlign: 'right',
                          }}>
                          {translate('Discount')}({currentCurrency?.symbol})
                        </Text>
                        <Text
                          style={{
                            width: '24%',
                            textAlign: 'right',
                            fontSize: 10,
                          }}>
                          {formatCurrency(discountValue || 0, {
                            currency: currentCurrency?.code,
                            excludeCurrencySymbol: true,
                            currencySymbol: currentCurrency?.symbol,
                            companyLang: selectedLng,
                          })}
                        </Text>
                      </View>

                      <View style={styles.footerRow}>
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

                      {vats.length > 0 && (
                        <View style={styles.footerRow}>
                          <Text style={{width: '44%'}} />
                          <View style={{width: '56%'}}>
                            {vats?.map((vat, index) => (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  paddingVertical: 4,
                                }}
                                key={`${vat.vat}-${index}`}>
                                <Text
                                  style={{
                                    color: '#616161',
                                    fontSize: 10,
                                    textAlign: 'right',
                                    width: '57%',
                                  }}>
                                  {translate('VAT')} {vat.percentageVat}%
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 10,
                                    textAlign: 'right',
                                    width: '43%',
                                  }}>
                                  {vat.vat}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      <View style={styles.footerRow}>
                        <Text style={{width: '44%'}} />
                        <Text
                          style={{
                            width: '32%',
                            color: '#212121',
                            fontSize: 10,
                            textAlign: 'right',
                          }}>
                          {translate('Total incl. VAT')}(
                          {`${currentCurrency?.symbol}`})
                        </Text>
                        <Text
                          style={{
                            width: '24%',
                            textAlign: 'right',
                            fontSize: 10,
                            color: '#212121',
                          }}>
                          {amountAfterGlobalDiscountWithVATFormatted}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {!!quotation?.additionalInfo?.paymentTerms?.trim() && (
                <View style={styles.paymentTermsSection}>
                  <Text style={styles.sectionHeading}>
                    {translate('Payment terms')}{' '}
                  </Text>
                  <HtmlPDF
                    html={quotation?.additionalInfo?.paymentTerms || ''}
                  />
                </View>
              )}

              {!!(
                quotation?.additionalInfo?.notes &&
                stripHtmlTags(quotation?.additionalInfo?.notes)
              ) && (
                <View style={styles.notesSection}>
                  <HtmlPDF
                    html={quotation?.additionalInfo?.notes || ''}
                    rootStyle={{
                      marginTop: 6,
                      marginBottom: 16,
                    }}
                  />
                </View>
              )}

              {!isJobOverview && (
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
              )}
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
