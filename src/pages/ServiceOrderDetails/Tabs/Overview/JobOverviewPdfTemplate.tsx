import {Document, StyleSheet, Text, View} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import React from 'react';
import {
  EditableServiceOrderItem,
  ServiceOrderAmountDetail,
  ServiceOrderView,
} from 'models/service-order';
import {formatDate} from 'utils/datetime';
import {centsToMoney, formatCurrency} from 'utils/currency';
import {QuotationView} from 'models/quotation';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {Currency, HeaderFooterInfoData} from 'models/misc';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import PdfBodyContainer from 'components/pdf-templates/containers/PdfBodyContainer';
import PdfPageContainer from 'components/pdf-templates/containers/PdfPageContainer';
import TopSectionContainer from 'components/pdf-templates/containers/TopSectionContainer';
import PdfPageTitle from 'components/pdf-templates/containers/PdfPageTitle';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
import PdfUnitAddress from 'components/pdf-templates/containers/PdfUnitAddress';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {toSentenceCase} from 'utils/string';
import {
  getAddressComponentFromQuotation,
  getAddressComponentFromServiceOrder,
} from 'utils/pdfTemplates';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import {HtmlPDF} from 'components/HtmlPDF';
import {ServiceCompanyItem} from 'models/service-company';
import ArticleTableHeader from 'components/pdf-templates/ArticleSection/ArticleTableHeader';
import {ArticleSectionBody} from 'components/pdf-templates/ArticleSection/ArticleSectionBody';
import ArticleSectionFooter from 'components/pdf-templates/ArticleSection/ArticleSectionFooter';
import {allItemsHaveZeroDiscount} from 'utils/discount';

const getStyles = ({
  boldFontStyle,
  primaryColor,
  secondaryColor,
}: PdfConfigurationStyles) =>
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
      color: primaryColor,
      width: '43%',
    },
    tagContent: {
      fontSize: 8.5,
      color: secondaryColor,
      width: '57%',
      textAlign: 'right',
    },
    dataBody: {
      borderBottom: '1px solid #212121',
      paddingBottom: 1,
    },
    contentBody: {
      color: primaryColor,
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
      color: primaryColor,
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
      fontSize: 8,
      color: secondaryColor,
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
  serviceCompany?: ServiceCompanyItem;
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
  serviceOrderItems: EditableServiceOrderItem[];
  serviceOrderAmountDetail?: ServiceOrderAmountDetail;
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const JobOverviewPdfTemplate = React.memo(
  ({
    serviceCompany,
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
    serviceOrderItems,
    serviceOrderAmountDetail,
    fontStyles,
    primaryColor,
    secondaryColor,
  }: Props) => {
    const elevatorAddress =
      quotation?.elevator.address ?? serviceOrder?.elevator?.address;

    const globalDiscount = getDiscoutObj(
      serviceOrder?.additionalInfo?.discount,
    );
    const discountAmount = globalDiscount?.amount;
    const discountValue = discountAmount?.value ?? 0;

    const amountAfterGlobalDiscount = centsToMoney(
      currentCurrency?.code!,
      serviceOrderAmountDetail?.amountAfterGlobalDiscount.netAmount ?? 0,
    );
    const amountAfterGlobalDiscountWithVAT = centsToMoney(
      currentCurrency?.code!,
      serviceOrderAmountDetail?.amountAfterGlobalDiscount.grossAmount ?? 0,
    );
    const vats = serviceOrderAmountDetail?.amountAfterGlobalDiscount.vats || [];

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
      quotation?.additionalInfo.alternativeServiceCompanyInfo,
    );

    const styles = getStyles({
      primaryColor,
      secondaryColor,
      boldFontStyle: fontStyles.bold,
    });

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

    const showDiscountCol = !allItemsHaveZeroDiscount(serviceOrderItems);
    return (
      <Document>
        <PdfPageContainer fontStyles={fontStyles} primaryColor={primaryColor}>
          <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

          <PdfBodyContainer>
            <TopSectionContainer>
              <PdfTemplateLeftAddress
                serviceCompany={serviceCompany}
                serviceCompanyInfo={serviceCompanyInfo}
                fallbackReceiverName={
                  serviceOrder?.elevator?.propertyOwner?.name
                }
                addressComponent={
                  getAddressComponentFromQuotation(quotation) ??
                  getAddressComponentFromServiceOrder(serviceOrder)
                }
                translate={translate}
                customerVATId={customerVATId}
                eanValue={eanValue}
                fontStyles={fontStyles}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
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
                    building={unitBuilding}
                    fontStyles={fontStyles}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                  />
                </View>
              </View>
            </TopSectionContainer>

            <View>
              <PdfPageTitle fontStyles={fontStyles} primaryColor={primaryColor}>
                {translate('Job Confirmation:')}{' '}
                {toSentenceCase(serviceOrderType)}
              </PdfPageTitle>

              {serviceOrder?.description.trim() !== '' && (
                <HtmlPDF
                  html={serviceOrder?.description || ''}
                  rootStyle={{
                    marginTop: 6,
                    marginBottom: 16,
                  }}
                  fontStyles={fontStyles}
                />
              )}

              {serviceOrderItems.length && (
                <View
                  style={{
                    marginTop: 16,
                    paddingRight: 5,
                  }}>
                  <View style={styles.table}>
                    <ArticleTableHeader
                      translate={translate}
                      currentCurrency={currentCurrency}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                      showDiscountCol={showDiscountCol}
                    />

                    <ArticleSectionBody
                      items={serviceOrderItems}
                      amountDetail={serviceOrderAmountDetail}
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
              )}
            </View>
          </PdfBodyContainer>

          <PdfTemplateFooter
            userInfo={userInfo}
            translate={translate}
            footerInfo={footerInfo}
            footerPath={footerPath}
            isQuotationJobConfirmation={!!quotation?.externalId}
            fontStyles={fontStyles}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </PdfPageContainer>
      </Document>
    );
  },
);

export default JobOverviewPdfTemplate;
