import {Document, Text, View} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import React from 'react';
import {formatDate} from 'utils/datetime';
import {centsToMoney, formatCurrency} from 'utils/currency';
import {
  EditableQuotationItem,
  QuotationAmountDetail,
  QuotationView,
} from 'models/quotation';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency, HeaderFooterInfoData} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {HtmlPDF} from 'components/HtmlPDF';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {getAddressComponentFromQuotation} from 'utils/pdfTemplates';
import {toSentenceCase} from 'utils/string';
import {ContextProps} from 'context/PdfStylesProvider';
import PdfBodyContainer from 'components/pdf-templates/containers/PdfBodyContainer';
import PdfPageContainer from 'components/pdf-templates/containers/PdfPageContainer';
import TopSectionContainer from 'components/pdf-templates/containers/TopSectionContainer';
import PdfPageTitleHtml from 'components/pdf-templates/containers/PdfPageTitleHtml';
import PdfUnitAddress from 'components/pdf-templates/containers/PdfUnitAddress';
import AlternativeAddressTemplate from 'components/pdf-templates/AlternativeAddressTemplate';
import PdfPageTitle from 'components/pdf-templates/containers/PdfPageTitle';
import {getStyles} from 'components/pdf-templates/QuotationPdfTemplate/QuotationPdfTemplete.styles';
import {ServiceCompanyItem} from 'models/service-company';
import {allItemsHaveZeroDiscount} from 'utils/discount';
import {hasAlternativeAddress} from 'utils/invoice';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {cleanHtml} from 'utils/rich-field-string';
import ArticleTableHeader from '../ArticleSection/ArticleTableHeader';
import ArticleSectionFooter from '../ArticleSection/ArticleSectionFooter';
import {ArticleSectionBody} from '../ArticleSection/ArticleSectionBody';

type BaseProps = {
  serviceCompany?: ServiceCompanyItem;
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
  quotationAmountDetail?: QuotationAmountDetail;
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
    serviceCompany,
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
    quotationAmountDetail,
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
      quotationAmountDetail?.amountAfterGlobalDiscount.netAmount ?? 0,
    );
    const amountAfterGlobalDiscountWithVAT = centsToMoney(
      currentCurrency?.code!,
      quotationAmountDetail?.amountAfterGlobalDiscount.grossAmount ?? 0,
    );
    const vats = quotationAmountDetail?.amountAfterGlobalDiscount.vats || [];

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

    const showDiscountCol = !allItemsHaveZeroDiscount(quotationItems);

    const serviceCompanyInfo = getServiceCompanyInfo(
      userInfo,
      quotation?.additionalInfo?.alternativeServiceCompanyInfo,
    );

    const {raw: rawPaymentTerm, plain: plainPaymentTerm} = cleanHtml(
      quotation?.additionalInfo?.paymentTerms,
    );
    const {raw: rawNotes, plain: plainNotes} = cleanHtml(
      quotation?.additionalInfo?.notes,
    );

    return (
      <Document>
        {hasAlternativeAddress(
          quotation?.additionalInfo?.alternativeAddress,
        ) && (
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
                serviceCompany={serviceCompany}
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
                  rootStyle={{
                    marginTop: 6,
                    marginBottom: 16,
                    body: fontStyles.regular,
                  }}
                  fontStyles={fontStyles}
                />
              )}

              {quotationItems.length && (
                <View
                  style={{
                    marginVertical: 16,
                    paddingRight: 5,
                  }}>
                  <View>
                    <View style={styles.table}>
                      <ArticleTableHeader
                        translate={translate}
                        currentCurrency={currentCurrency}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                        showDiscountCol={showDiscountCol}
                      />

                      <ArticleSectionBody
                        items={quotationItems}
                        amountDetail={quotationAmountDetail}
                        currentCurrency={currentCurrency}
                        selectedLng={selectedLng}
                        translate={translate}
                        primaryColor={primaryColor}
                        showDiscountCol={showDiscountCol}
                        fontStyles={fontStyles}
                      />

                      <ArticleSectionFooter
                        translate={translate}
                        discountValue={discountValue}
                        currentCurrency={currentCurrency}
                        selectedLng={selectedLng}
                        amountAfterGlobalDiscountFormatted={
                          amountAfterGlobalDiscountFormatted
                        }
                        vats={vats}
                        amountAfterGlobalDiscountWithVATFormatted={
                          amountAfterGlobalDiscountWithVATFormatted
                        }
                        primaryColor={primaryColor}
                        fontStyles={fontStyles}
                      />
                    </View>
                  </View>
                </View>
              )}

              {plainPaymentTerm && (
                <View style={styles.paymentTermsSection}>
                  <Text style={styles.sectionHeading}>
                    {translate('Payment terms')}
                  </Text>
                  <HtmlPDF html={rawPaymentTerm} fontStyles={fontStyles} />
                </View>
              )}

              {plainNotes && (
                <View style={styles.notesSection}>
                  <HtmlPDF
                    html={rawNotes}
                    rootStyle={{
                      marginTop: 6,
                      marginBottom: 16,
                    }}
                    fontStyles={fontStyles}
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
