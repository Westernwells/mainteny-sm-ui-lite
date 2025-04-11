import {Document, Text, View} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import React from 'react';
import {formatDate} from 'utils/datetime';
import {centsToMoney, formatCurrency, getCurrencySymbol} from 'utils/currency';
import {EditableQuotationItem, QuotationView} from 'models/quotation';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency, HeaderFooterInfoData} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {HtmlPDF} from 'components/HtmlPDF';
import {stripHtmlTags} from 'pages/InvoiceDetails/utils';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {
  getAddressComponentFromQuotation,
  insertNewlines,
} from 'utils/pdfTemplates';
import {toSentenceCase} from 'utils/string';
import {
  getDiscountDisplay,
  getQuotationItemTotalAfterPerItemDiscount,
} from 'utils/quotation';
import {ContextProps} from 'context/PdfStylesProvider';
import PdfBodyContainer from 'components/pdf-templates/containers/PdfBodyContainer';
import PdfPageContainer from 'components/pdf-templates/containers/PdfPageContainer';
import TopSectionContainer from 'components/pdf-templates/containers/TopSectionContainer';
import PdfPageTitleHtml from 'components/pdf-templates/containers/PdfPageTitleHtml';
import PdfUnitAddress from 'components/pdf-templates/containers/PdfUnitAddress';
import AlternativeAddressTemplate from 'components/pdf-templates/AlternativeAddressTemplate';
import PdfPageTitle from 'components/pdf-templates/containers/PdfPageTitle';
import {getStyles} from 'components/pdf-templates/QuotationPdfTemplate/QuotationPdfTemplete.styles';

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
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

type JobOverviewProps = BaseProps & {
  isJobOverview: true;
  serviceOrderType: string;
};

type NonJobOverviewProps = BaseProps & {
  isJobOverview?: false;
  serviceOrderType?: string;
};
export type Props = JobOverviewProps | NonJobOverviewProps;
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
    fontStyles,
    primaryColor,
    secondaryColor,
  }: Props) => {
    const discount = quotation?.additionalInfo?.discount;
    const discountAmount = discount?.amount;
    const discountValue = centsToMoney(
      currentCurrency?.code!,
      discountAmount?.value ?? 0,
    );

    const amountAfterGlobalDiscount = centsToMoney(
      currentCurrency?.code!,
      quotation?.totalAmount.netAmount ?? 0,
    );
    const amountAfterGlobalDiscountWithVAT = centsToMoney(
      currentCurrency?.code!,
      quotation?.totalAmount.grossAmount ?? 0,
    );
    const vats = quotation?.totalAmount.vats || [];

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

    const styles = getStyles({
      boldFontStyle: fontStyles.bold,
      regularFontStyle: fontStyles.regular,
      primaryColor,
      secondaryColor,
    });

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
              translate={translate}
              headerInfo={headerInfo}
              headerPath={headerPath}
              footerInfo={footerInfo}
              footerPath={footerPath}
              alternativeServiceCompanyInfo={
                quotation?.additionalInfo.alternativeServiceCompanyInfo
              }
              alternativeAddress={quotation?.additionalInfo.alternativeAddress}
              fontStyles={fontStyles}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          )}

        <PdfPageContainer fontStyles={fontStyles} primaryColor={primaryColor}>
          <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

          <PdfBodyContainer>
            <TopSectionContainer>
              <PdfTemplateLeftAddress
                serviceCompanyInfo={serviceCompanyInfo}
                fallbackReceiverName={quotation?.propertyOwner?.name}
                addressComponent={getAddressComponentFromQuotation(quotation)}
                translate={translate}
                beneficiaryInfo={
                  quotation?.additionalInfo.beneficiaryAddress?.component
                }
                customerVATId={customerVATId}
                eanValue={eanValue}
                fontStyles={fontStyles}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
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

                {!!quotation?.additionalInfo.referenceNumber && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>
                      {translate('Reference Number')}
                    </Text>
                    <Text style={styles.tagContent}>
                      {quotation?.additionalInfo.referenceNumber}
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
                    building={unitBuilding}
                    fontStyles={fontStyles}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                  />
                </View>
              </View>
            </TopSectionContainer>

            <View>
              {isJobOverview ? (
                <PdfPageTitle
                  fontStyles={fontStyles}
                  primaryColor={primaryColor}>
                  {translate('Job Confirmation:')}{' '}
                  {translate(toSentenceCase(serviceOrderType))}
                </PdfPageTitle>
              ) : (
                <View>
                  <PdfPageTitleHtml
                    value={quotation?.subject}
                    fontStyles={fontStyles}
                    primaryColor={primaryColor}
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
                  marginVertical: 16,
                  paddingRight: 5,
                }}>
                <View>
                  <View style={styles.table}>
                    <View style={styles.tableHead}>
                      <View style={styles.tableRow}>
                        <View style={[styles.col2Left]}>
                          <Text style={[styles.tableHeading]}>#</Text>
                        </View>
                        <View style={[styles.col40Left]}>
                          <Text style={[styles.tableHeading]}>
                            {translate('Name')}
                          </Text>
                        </View>
                        <View style={[styles.col10Right]}>
                          <Text style={[styles.tableHeading]}>
                            {translate('Quantity')}
                          </Text>
                        </View>
                        <View style={[styles.col8Center]}>
                          <Text style={[styles.tableHeading]}>
                            {translate('Unit')}
                          </Text>
                        </View>
                        <View style={[styles.col15Right]}>
                          <Text style={[styles.tableHeading]}>
                            {`${translate('Price')} (${
                              getCurrencySymbol[currentCurrency?.code!]
                            })`}
                          </Text>
                        </View>
                        <View style={[styles.col10Right]}>
                          <Text style={[styles.tableHeading]}>
                            {translate('Discount')}
                          </Text>
                        </View>

                        <View style={[styles.col15Right]}>
                          <Text style={[styles.tableHeading]}>
                            {`${translate('Total')} (${
                              getCurrencySymbol[currentCurrency?.code!]
                            })`}
                          </Text>
                        </View>
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
                              <View style={styles.col2Left}>
                                <Text>
                                  {insertNewlines(
                                    mainPosition.userSeqNumber!,
                                  ) || index + 1}
                                </Text>
                              </View>

                              <View style={styles.col40Left}>
                                <Text>{mainPosition.name || '-'}</Text>
                              </View>

                              <View style={styles.col10Right}>
                                <Text>{mainPosition?.quantity || '-'}</Text>
                              </View>

                              <View style={styles.col8Center}>
                                <Text>
                                  {translate(
                                    mainPosition?.article?.unit || '-',
                                  )}
                                </Text>
                              </View>

                              <View style={styles.col15Right}>
                                <Text>
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
                              </View>

                              <View style={styles.col10Right}>
                                <Text>
                                  {getDiscountDisplay(
                                    mainPosition.discount,
                                    currentCurrency,
                                    selectedLng,
                                  )}
                                </Text>
                              </View>

                              <View style={styles.col15Right}>
                                <Text>
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
                                    <View style={styles.tableRow}>
                                      <View style={styles.col2Left}>
                                        <Text>
                                          {insertNewlines(
                                            subItem.userSeqNumber!,
                                          ) || `${index + 1}.${subIndex + 1}`}
                                        </Text>
                                      </View>

                                      <View style={styles.col40Left}>
                                        <Text>
                                          {subItem?.name ||
                                            subItem?.article?.name ||
                                            '-'}
                                        </Text>
                                      </View>

                                      <View style={styles.col10Right}>
                                        <Text> {subItem?.quantity || '-'}</Text>
                                      </View>

                                      <View style={styles.col8Center}>
                                        <Text>
                                          {translate(
                                            subItem?.article?.unit || '-',
                                          )}
                                        </Text>
                                      </View>

                                      <View style={styles.col15Right}>
                                        {mainPosition.subItemsConfig
                                          ?.priceVisible ? (
                                          <Text>
                                            {formatCurrency(
                                              centsToMoney(
                                                currentCurrency?.code!,
                                                subItem?.unitAmount
                                                  ?.netAmount || 0,
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
                                          <Text />
                                        )}
                                      </View>

                                      <View style={styles.col10Right}>
                                        <Text />
                                      </View>

                                      <View style={styles.col15Right}>
                                        <Text>
                                          {mainPosition.subItemsConfig
                                            ?.priceVisible ? (
                                            <Text>
                                              {formatCurrency(
                                                centsToMoney(
                                                  currentCurrency?.code!,
                                                  (subItem.unitAmount
                                                    ?.netAmount ?? 0) *
                                                    (subItem.quantity ?? 1) ||
                                                    0,
                                                ),
                                                {
                                                  currency:
                                                    currentCurrency?.code,
                                                  excludeCurrencySymbol: true,
                                                  currencySymbol:
                                                    currentCurrency?.symbol,
                                                  companyLang: selectedLng,
                                                },
                                              )}
                                            </Text>
                                          ) : (
                                            <Text />
                                          )}
                                        </Text>
                                      </View>
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
                            color: primaryColor,
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
                            color: primaryColor,
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
                                    color: primaryColor,
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
                                  {centsToMoney(
                                    currentCurrency?.code!,
                                    vat.vat,
                                  ).toFixed(2)}
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
                            color: secondaryColor,
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
                            color: secondaryColor,
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

export default QuotationPdfTemplate;
