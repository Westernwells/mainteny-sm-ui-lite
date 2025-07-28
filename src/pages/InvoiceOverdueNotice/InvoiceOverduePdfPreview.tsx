import {Document, StyleSheet, Text, View} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {InvoiceView} from 'models/invoice';
import {FormikProps} from 'formik';
import {formatDate, toDate} from 'utils/datetime';
import {formatCurrency} from 'utils/currency';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {Currency, HeaderFooterInfoData} from 'models/misc';
import PdfPageContainer from 'components/pdf-templates/containers/PdfPageContainer';
import TopSectionContainer from 'components/pdf-templates/containers/TopSectionContainer';
import PdfBodyContainer from 'components/pdf-templates/containers/PdfBodyContainer';
import PdfPageTitle from 'components/pdf-templates/containers/PdfPageTitle';
import {HtmlPDF} from 'components/HtmlPDF';
import {getServiceCompanyInfo} from 'utils/company-utils';
import {ClientReportForPDFConfig} from 'models/client-storage';
import {useMemo} from 'react';
import {getAddressComponentFromInvoice} from 'utils/pdfTemplates';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import {ServiceCompanyItem} from 'models/service-company';
import {isSwissAddress} from 'utils/address';
import PdfEmailContent from 'components/pdf-templates/containers/PdfEmailContent';

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
    },
    tag: {
      ...boldFontStyle,
      fontSize: 9,
      color: primaryColor,
      width: '43%',
    },
    tagContent: {
      fontSize: 9,
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
      color: primaryColor,
      fontSize: 10,
      marginBottom: 10,
      lineHeight: 1.3,
      maxWidth: '100%',
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
      fontSize: 7,
      textTransform: 'uppercase',
    },
    tableRow: {
      display: 'flex',
      flexDirection: 'row',
      fontSize: 10,
      marginVertical: 4,
    },
    amountText: {
      ...boldFontStyle,
      fontSize: 10,
      color: primaryColor,
    },
  });

type Props = {
  serviceCompany?: ServiceCompanyItem;
  translate: (key: string, options?: {context: string}) => string;
  userInfo?: UserAccount | undefined;
  currentCurrency?: Currency;
  selectedLng?: string;
  invoice?: InvoiceView;
  formik: FormikProps<{
    customerAddress: string;
    invoiceNumber: string;
    subject: string;
    description: string;
    initialAmount: number;
    handlingFee: number;
  }>;
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
  pdfConfigClientStorage: ClientReportForPDFConfig;
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const InvoiceOverduePdfPreview = ({
  serviceCompany,
  translate,
  userInfo,
  currentCurrency,
  selectedLng,
  invoice,
  formik,
  headerInfo,
  headerPath,
  footerInfo,
  footerPath,
  pdfConfigClientStorage,
  fontStyles,
  primaryColor,
  secondaryColor,
}: Props) => {
  const serviceCompanyInfo = getServiceCompanyInfo(
    userInfo,
    invoice?.additionalInfo?.alternativeServiceCompanyInfo,
  );

  const styles = getStyles({
    boldFontStyle: fontStyles.bold,
    regularFontStyle: fontStyles.regular,
    primaryColor,
    secondaryColor,
    isSwissOffset: isSwissAddress(serviceCompany?.businessAddress),
  });

  const overdueTotal = (initialAmount: number, handlingAmount: number) =>
    formatCurrency(handlingAmount + initialAmount, {
      currency: currentCurrency?.code,
      excludeCurrencySymbol: true,
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
    });

  const elevatorExternalId = useMemo(
    () =>
      invoice?.additionalInfo.elevatorExternalId ||
      invoice?.serviceOrder?.elevator.externalId,
    [
      invoice?.additionalInfo.elevatorExternalId,
      invoice?.serviceOrder?.elevator.externalId,
    ],
  );

  const customerVATId =
    (pdfConfigClientStorage.includeCustomerVAT &&
      invoice?.propertyOwner?.additionalInfo?.vatId) ||
    '';

  const eanValue = invoice?.propertyOwner.additionalInfo?.ean || '';

  return (
    <Document>
      <PdfPageContainer fontStyles={fontStyles} primaryColor={primaryColor}>
        <PdfTemplateHeader headerInfo={headerInfo} headerPath={headerPath} />

        <PdfBodyContainer>
          <TopSectionContainer>
            <PdfTemplateLeftAddress
              serviceCompany={serviceCompany}
              serviceCompanyInfo={serviceCompanyInfo}
              fallbackReceiverName={invoice?.propertyOwner?.name}
              addressComponent={getAddressComponentFromInvoice(invoice)}
              translate={translate}
              customerVATId={customerVATId}
              eanValue={eanValue}
              fontStyles={fontStyles}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />

            <View style={styles.rightAddress}>
              {formik?.values.invoiceNumber && (
                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}>{translate('Invoice no.')}</Text>
                  <Text style={styles.tagContent}>
                    {formik?.values.invoiceNumber || '-'}
                  </Text>
                </View>
              )}

              <View style={styles.rightAddressContent}>
                <Text style={styles.tag}>{translate('Invoice date')}</Text>
                <Text style={styles.tagContent}>
                  {formatDate(toDate(invoice?.sentDate)) ||
                    formatDate(new Date())}
                </Text>
              </View>

              {pdfConfigClientStorage.includeUsername &&
                (userInfo?.firstName || userInfo?.lastName) && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Generated by')}</Text>
                    <Text style={styles.tagContent}>
                      {userInfo?.firstName} {userInfo?.lastName}
                    </Text>
                  </View>
                )}

              {userInfo?.contact?.phone &&
                pdfConfigClientStorage.includeUserPhone && (
                  <View style={styles.rightAddressContent}>
                    <Text style={styles.tag}>{translate('Phone no.')}</Text>
                    <Text style={styles.tagContent}>
                      {userInfo?.contact?.phone}
                    </Text>
                  </View>
                )}
              <PdfEmailContent
                email={userInfo?.contact?.email}
                includeEmail={pdfConfigClientStorage?.includeUserEmail}
                translate={translate}
                fontStyles={fontStyles}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                styles={{
                  container: styles.rightAddressContent,
                  label: styles.tag,
                  content: styles.tagContent,
                }}
              />
              {invoice?.propertyOwner?.externalId && (
                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}>{translate('Customer no.')}</Text>
                  <Text style={styles.tagContent}>
                    {invoice?.propertyOwner?.externalId || '-'}{' '}
                  </Text>
                </View>
              )}

              {invoice?.dueDate && (
                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}>{translate('Due date')}</Text>
                  <Text style={styles.tagContent}>
                    {formatDate(invoice?.dueDate) || '-'}{' '}
                  </Text>
                </View>
              )}

              <View style={{marginTop: 20}}>
                {pdfConfigClientStorage.includeUnitNumber &&
                  elevatorExternalId && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}>
                        {translate('Unit no.', {context: 'elevator'})}
                      </Text>
                      <Text style={styles.tagContent}>
                        {elevatorExternalId}
                      </Text>
                    </View>
                  )}
                {invoice?.serviceOrder?.elevator.serialNumber &&
                  pdfConfigClientStorage.includeSerialNumber && (
                    <View style={styles.rightAddressContent}>
                      <Text style={styles.tag}>{translate('Serial no.')}</Text>
                      <Text style={styles.tagContent}>
                        {invoice?.serviceOrder?.elevator.serialNumber ?? '-'}
                      </Text>
                    </View>
                  )}
              </View>
            </View>
          </TopSectionContainer>

          <View>
            <PdfPageTitle fontStyles={fontStyles} primaryColor={primaryColor}>
              {formik?.values.subject}
            </PdfPageTitle>

            {formik?.values?.description && (
              <View>
                <HtmlPDF
                  html={formik?.values?.description || ''}
                  rootStyle={styles.contentBody}
                  fontStyles={fontStyles}
                />
              </View>
            )}

            <View style={styles.table}>
              <View style={styles.tableHead}>
                <View style={styles.tableRow}>
                  <Text
                    style={{
                      width: '5%',
                      textAlign: 'left',
                      marginRight: 10,
                      ...styles.tableHeading,
                    }}>
                    #
                  </Text>
                  <Text
                    style={{
                      width: '70%',
                      textAlign: 'left',
                      ...styles.tableHeading,
                    }}>
                    {translate('Name')}
                  </Text>
                  <Text
                    style={{
                      width: '25%',
                      textAlign: 'right',
                      ...styles.tableHeading,
                    }}>
                    {`${translate('Total incl. VAT')} (${
                      currentCurrency?.symbol
                    })`}
                  </Text>
                </View>
              </View>

              <View style={styles.dataBody}>
                <View style={styles.tableRow}>
                  <Text
                    style={{
                      width: '5%',
                      textAlign: 'left',
                      marginRight: 10,
                      color: '#212121',
                    }}>
                    1
                  </Text>
                  <Text
                    style={{
                      width: '75%',
                      textAlign: 'left',
                      color: '#212121',
                    }}>
                    {translate('Initial amount')}
                  </Text>
                  <Text
                    style={{
                      width: '20%',
                      textAlign: 'right',
                      color: '#212121',
                    }}>
                    {formatCurrency(formik?.values.initialAmount ?? 0, {
                      currency: currentCurrency?.code,
                      excludeCurrencySymbol: true,
                      currencySymbol: currentCurrency?.symbol,
                      companyLang: selectedLng,
                    })}
                  </Text>
                </View>

                <View style={styles.tableRow}>
                  <Text
                    style={{
                      width: '5%',
                      textAlign: 'left',
                      marginRight: 10,
                      color: '#212121',
                    }}>
                    2
                  </Text>
                  <Text
                    style={{
                      width: '70%',
                      textAlign: 'left',
                      color: '#212121',
                    }}>
                    {translate('Handling fee')}
                  </Text>
                  <Text
                    style={{
                      width: '25%',
                      textAlign: 'right',
                      color: '#212121',
                    }}>
                    {formatCurrency(formik.values.handlingFee ?? 0, {
                      currency: currentCurrency?.code,
                      excludeCurrencySymbol: true,
                      currencySymbol: currentCurrency?.symbol,
                      companyLang: selectedLng,
                    })}
                  </Text>
                </View>
              </View>

              <View>
                <View style={styles.tableRow}>
                  <Text style={{width: '42%'}} />
                  <Text
                    style={{
                      width: '38%',
                      textAlign: 'left',
                      ...styles.amountText,
                    }}>
                    {`${translate('Outstanding amount incl. VAT')} (${
                      currentCurrency?.symbol
                    })`}
                  </Text>
                  <Text
                    style={{
                      width: '20%',
                      textAlign: 'right',
                      ...styles.amountText,
                    }}>
                    {overdueTotal(
                      formik.values.initialAmount,
                      formik.values.handlingFee,
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
};

export default InvoiceOverduePdfPreview;
