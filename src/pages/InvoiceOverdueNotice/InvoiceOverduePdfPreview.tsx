import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import PdfTemplateHeader from 'components/pdf-templates/PdfTemplateHeader';
import PdfTemplateFooter from 'components/pdf-templates/PdfTemplateFooter';
import {InvoiceView} from 'models/invoice';
import {FormikProps} from 'formik';
import {formatDate, toDate} from 'utils/datetime';
import {formatCurrency} from 'utils/currency';
import PdfTemplateLeftAddress from 'components/pdf-templates/PdfTemplateLeftAddress';
import {Currency} from 'models/misc';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import MontserratRegular from '../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
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
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 40,
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
      fontSize: 9,
      color: '#212121',
      width: '43%',
    },
    tagContent: {
      fontSize: 9,
      color: '#616161',
      width: '57%',
      textAlign: 'right',
      ...regularFontStyle,
    },
    dataBody: {
      borderBottom: '1px solid #212121',
      paddingBottom: 1,
    },
    contentHeader: {
      fontSize: 14,
      color: '#212121',
      marginTop: 150,
      marginBottom: 20,
      ...boldFontStyle,
    },
    contentBody: {
      color: '#616161',
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
      color: '#616161',
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
      color: '#212121',
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
};

const InvoiceOverduePdfPreview = ({
  translate,
  userInfo,
  logoSrc,
  currentCurrency,
  logoDimensions,
  selectedLng,
  invoice,
  formik,
}: Props) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const regularFontStyle = {
    fontFamily:
      selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
  };

  const styles = getStyles(boldFontStyle, regularFontStyle);

  const overdueTotal = (initialAmount: number, handlingAmount: number) =>
    formatCurrency(handlingAmount + initialAmount ?? 0, {
      currency: currentCurrency?.code,
      excludeCurrencySymbol: true,
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
    });

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
                invoice?.propertyOwner.billingAddress?.component
              }
              selectedLng={selectedLng}
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

              {(userInfo?.firstName || userInfo?.lastName) && (
                <View style={styles.rightAddressContent}>
                  <Text style={styles.tag}>{translate('Generated by')}</Text>
                  <Text style={styles.tagContent}>
                    {userInfo?.firstName} {userInfo?.lastName}
                  </Text>
                </View>
              )}

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
            </View>
          </View>

          <View>
            <Text style={styles.contentHeader}>{formik?.values.subject}</Text>

            {formik?.values?.description && (
              <Text style={styles.contentBody}>
                {formik?.values?.description}
              </Text>
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
        </View>

        <PdfTemplateFooter
          userInfo={userInfo}
          selectedLng={selectedLng}
          translate={translate}
        />
      </Page>
    </Document>
  );
};

export default InvoiceOverduePdfPreview;
