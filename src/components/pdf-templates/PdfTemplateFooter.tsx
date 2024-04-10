import {View, StyleSheet, Text, Font} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';

type Props = {
  translate: (key: string) => string;
  userInfo?: UserAccount;
  selectedLng?: string;
};

Font.register({
  family: 'Montserrat-Bold',
  format: 'truetype',
  src: MontserratBold,
});

Font.register({
  family: 'NotoSans-Bold',
  format: 'truetype',
  src: NotoSansGeorgianBold,
});

const getStyles = (boldFontStyle?: {fontFamily: string}) =>
  StyleSheet.create({
    footerEmail: {
      display: 'flex',
      flexDirection: 'row',
    },
    footerSectionBody: {
      fontSize: 5,
      fontWeight: 'light',
      color: '#616161',
      display: 'flex',
      flexDirection: 'column',
      paddingVertical: 0.5,
    },
    footerWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row',
      paddingBottom: 7,
      borderBottom: '1px solid #616161',
      alignItems: 'center',
      marginTop: 5,
    },
    footerEmailWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    leftFooter: {
      display: 'flex',
      flexDirection: 'row',
      flex: '0 0 75%',
      justifyContent: 'space-between',
    },
    emailText: {
      fontSize: 5,
      color: '#616161',
      fontWeight: 'light',
    },
    pageNumberText: {
      fontSize: 7,
      color: '#000000',
      marginLeft: 4,
      textAlign: 'right',
      ...boldFontStyle,
    },
    numberText: {
      color: '#212121',
    },
    footerContainer: {
      flexDirection: 'column',
      width: '100%',
      paddingTop: 10,
      marginTop: 105,
      height: 55,
      position: 'absolute',
      bottom: 25,
      left: 68,
      right: 45,
    },
    qrCode: {
      width: 60,
      height: 60,
    },
    footerContent: {
      marginRight: 10,
      maxWidth: 130,
      flex: '0 0 32%',
    },
    footerHeading: {
      paddingVertical: 0.5,
      fontSize: 5,
      ...boldFontStyle,
    },
  });

const PdfTemplateFooter = ({userInfo, selectedLng, translate}: Props) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const styles = getStyles(boldFontStyle);

  return (
    <View fixed style={styles.footerContainer}>
      <View style={styles.footerWrapper}>
        <View style={styles.leftFooter}>
          <View style={styles.footerContent}>
            {userInfo?.serviceCompany.name && (
              <Text style={styles.footerHeading}>
                {userInfo?.serviceCompany?.name}
              </Text>
            )}

            {userInfo?.serviceCompany?.businessAddress?.component?.street && (
              <Text style={styles.footerSectionBody}>
                {userInfo?.serviceCompany?.businessAddress?.component?.street}
              </Text>
            )}

            {(userInfo?.serviceCompany?.businessAddress?.component
              ?.postalCode ||
              userInfo?.serviceCompany?.businessAddress?.component?.state ||
              userInfo?.serviceCompany?.businessAddress?.component
                ?.country) && (
              <Text style={styles.footerSectionBody}>
                {
                  userInfo?.serviceCompany?.businessAddress?.component
                    ?.postalCode
                }
                {userInfo?.serviceCompany?.businessAddress?.component?.state}
                {userInfo?.serviceCompany?.businessAddress?.component?.state &&
                  '·'}
                {userInfo?.serviceCompany?.businessAddress?.component?.country}
              </Text>
            )}

            {userInfo?.serviceCompany?.contact?.phone && (
              <Text style={styles.footerSectionBody}>
                {translate('Tel.')}: {userInfo?.serviceCompany?.contact?.phone}
              </Text>
            )}
          </View>

          <View style={styles.footerContent}>
            <Text style={styles.footerHeading}>{translate('Bank')}:</Text>

            {userInfo?.serviceCompany?.settings?.paymentInfo?.accountNumber && (
              <Text style={styles.footerSectionBody}>
                {translate('Acc. nr.')}:{' '}
                {userInfo?.serviceCompany?.settings?.paymentInfo?.accountNumber}
              </Text>
            )}

            {userInfo?.serviceCompany?.settings?.paymentInfo?.iban && (
              <Text style={styles.footerSectionBody}>
                {translate('IBAN')}:{' '}
                {userInfo?.serviceCompany?.settings?.paymentInfo?.iban}
              </Text>
            )}

            {userInfo?.serviceCompany?.settings?.paymentInfo?.bic && (
              <Text style={styles.footerSectionBody}>
                {translate('BIC')}:{' '}
                {userInfo?.serviceCompany?.settings?.paymentInfo?.bic}
              </Text>
            )}
          </View>

          <View style={styles.footerContent}>
            {userInfo?.serviceCompany?.settings?.managingDirector && (
              <Text style={styles.footerHeading}>
                {translate('Managing Director')}:{' '}
                {userInfo?.serviceCompany?.settings?.managingDirector}
              </Text>
            )}

            {userInfo?.serviceCompany?.settings?.arbitrationCourt && (
              <Text style={styles.footerSectionBody}>
                {translate('Registration court')}:{' '}
                {userInfo?.serviceCompany?.settings?.arbitrationCourt}
              </Text>
            )}

            {userInfo?.serviceCompany?.settings?.vatId && (
              <Text style={styles.footerSectionBody}>
                {translate('VAT ID')}:{' '}
                {userInfo?.serviceCompany?.settings?.vatId}{' '}
              </Text>
            )}

            {userInfo?.serviceCompany?.settings?.tradeRegisterNumber && (
              <Text style={styles.footerSectionBody}>
                {translate('Certified')}:{' '}
                {userInfo?.serviceCompany?.settings?.tradeRegisterNumber}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.footerEmailWrapper}>
        <View style={styles.leftFooter}>
          {userInfo?.serviceCompany?.contact?.url && (
            <View style={styles.footerContent}>
              <Text style={styles.emailText}>
                {userInfo?.serviceCompany?.contact?.url}
              </Text>
            </View>
          )}

          {userInfo?.serviceCompany.contact.email && (
            <View style={{...styles.footerContent, marginLeft: 2}}>
              <Text style={styles.emailText}>
                {userInfo?.serviceCompany?.contact?.email}
              </Text>
            </View>
          )}

          <Text style={styles.footerContent} />
        </View>
        <View>
          <Text
            style={styles.pageNumberText}
            render={({pageNumber, totalPages}) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </View>
    </View>
  );
};

export default PdfTemplateFooter;
