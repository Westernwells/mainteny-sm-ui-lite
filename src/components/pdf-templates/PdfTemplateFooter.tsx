import {View, StyleSheet, Text, Font, Image} from '@react-pdf/renderer';
import {UserAccount} from 'models/user';
import {HeaderFooterInfoData} from 'models/misc';
import MontserratBold from '../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import NotoSansGeorgianBold from '../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';

type Props = {
  translate: (key: string) => string;
  userInfo?: UserAccount;
  selectedLng?: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
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
const getStyles = (
  boldFontStyle?: {fontFamily: string},
  flexBasisValue?: string,
  itemCount?: number,
) =>
  StyleSheet.create({
    footerEmail: {
      display: 'flex',
      flexDirection: 'row',
    },
    footerSectionBody: {
      fontSize: 6,
      fontWeight: 'light',
      color: '#616161',
      display: 'flex',
      flexDirection: 'column',
      paddingVertical: 0.5,
      flexWrap: 'wrap',
      paddingRight: 1,
      wordWrap: 'break-word',
    },
    footerWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row',
      paddingBottom: 10,
      borderBottom: '1px solid #616161',
      alignItems: 'center',
    },
    footerEmailWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
      paddingBottom: 15,
    },
    leftEmailFooter: {
      display: 'flex',
      flexDirection: 'row',
      flex: itemCount === 3 ? '0 0 85%' : '0 0 60%',
      justifyContent: 'space-between',
      paddingRight: 10,
    },
    leftFooter: {
      display: 'flex',
      flexDirection: 'row',
      flex: '0 0 95%',
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
      zIndex: 1000,
      padding: '5px',
      backgroundColor: 'white',
    },
    numberText: {
      color: '#212121',
    },
    footerContainer: {
      flexDirection: 'column',
      width: 595,
      height: 86,
      position: 'absolute',
      bottom: 0,
      paddingTop: 5,
      paddingLeft: 57,
      paddingRight: 35,
    },
    footerContent: {
      marginRight: 10,
      maxWidth: '100%',
      flex: `0 0 ${flexBasisValue}`,
      paddingRight: 10,
    },
    footerHeading: {
      paddingVertical: 0.5,
      fontSize: 6,
      ...boldFontStyle,
    },
    imageContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
    },
  });
const PdfTemplateFooter = ({
  userInfo,
  selectedLng,
  translate,
  footerInfo,
  footerPath,
}: Props) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const visibleBankSections = [
    userInfo?.serviceCompany?.settings?.paymentInfo?.bankName,
    userInfo?.serviceCompany?.settings?.paymentInfo2?.bankName,
  ].filter(Boolean);

  const itemCount = visibleBankSections.length < 2 ? 3 : 4;
  const flexBasisValue = `${100 / itemCount}%`;

  const styles = getStyles(boldFontStyle, flexBasisValue, itemCount);

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
            {userInfo?.serviceCompany?.billingAddress?.fullName && (
              <Text style={styles.footerSectionBody}>
                {userInfo?.serviceCompany?.billingAddress?.fullName}
              </Text>
            )}
            {userInfo?.serviceCompany?.contact?.phone && (
              <Text style={styles.footerSectionBody}>
                {translate('Tel.')}: {userInfo?.serviceCompany?.contact?.phone}
              </Text>
            )}
          </View>

          {userInfo?.serviceCompany?.settings?.paymentInfo?.bankName && (
            <View style={styles.footerContent}>
              {userInfo?.serviceCompany?.settings?.paymentInfo?.bankName && (
                <Text style={styles.footerHeading}>
                  {translate('Bank')}:{' '}
                  {userInfo?.serviceCompany?.settings?.paymentInfo?.bankName}
                </Text>
              )}

              {userInfo?.serviceCompany?.settings?.paymentInfo
                ?.accountNumber && (
                <Text style={styles.footerSectionBody}>
                  {translate('Acc. nr.')}:{' '}
                  {
                    userInfo?.serviceCompany?.settings?.paymentInfo
                      ?.accountNumber
                  }
                </Text>
              )}
              {userInfo?.serviceCompany?.settings?.paymentInfo?.iban && (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap:
                      userInfo?.serviceCompany?.settings?.paymentInfo?.iban
                        .length < 23
                        ? 'nowrap'
                        : 'wrap',
                  }}>
                  <Text style={styles.footerSectionBody}>
                    {translate('IBAN')}:{' '}
                  </Text>
                  <Text style={{...styles.footerSectionBody, flexShrink: 1}}>
                    {userInfo?.serviceCompany?.settings?.paymentInfo?.iban}
                  </Text>
                </View>
              )}
              {userInfo?.serviceCompany?.settings?.paymentInfo?.bic && (
                <Text style={styles.footerSectionBody}>
                  {translate('BIC')}:{' '}
                  {userInfo?.serviceCompany?.settings?.paymentInfo?.bic}
                </Text>
              )}
            </View>
          )}

          {userInfo?.serviceCompany?.settings?.paymentInfo2?.bankName && (
            <View style={styles.footerContent}>
              {userInfo?.serviceCompany?.settings?.paymentInfo2?.bankName && (
                <Text style={styles.footerHeading}>
                  {translate('Bank')}:{' '}
                  {userInfo?.serviceCompany?.settings?.paymentInfo2?.bankName}
                </Text>
              )}

              {userInfo?.serviceCompany?.settings?.paymentInfo2
                ?.accountNumber && (
                <Text style={styles.footerSectionBody}>
                  {translate('Acc. nr.')}:{' '}
                  {
                    userInfo?.serviceCompany?.settings?.paymentInfo2
                      ?.accountNumber
                  }
                </Text>
              )}

              {userInfo?.serviceCompany?.settings?.paymentInfo2?.iban && (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap:
                      userInfo?.serviceCompany?.settings?.paymentInfo2?.iban
                        .length < 23
                        ? 'nowrap'
                        : 'wrap',
                  }}>
                  <Text style={styles.footerSectionBody}>
                    {translate('IBAN')}:{' '}
                  </Text>
                  <Text style={{...styles.footerSectionBody, flexShrink: 1}}>
                    {userInfo?.serviceCompany?.settings?.paymentInfo2?.iban}
                  </Text>
                </View>
              )}

              {userInfo?.serviceCompany?.settings?.paymentInfo2?.bic && (
                <Text style={styles.footerSectionBody}>
                  {translate('BIC')}:{' '}
                  {userInfo?.serviceCompany?.settings?.paymentInfo2?.bic}
                </Text>
              )}
            </View>
          )}

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

            {userInfo?.serviceCompany?.settings?.taxNumber && (
              <Text style={styles.footerSectionBody}>
                {translate('Tax ID')}:{' '}
                {userInfo?.serviceCompany?.settings?.taxNumber}
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
        <View style={styles.leftEmailFooter}>
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
            render={({pageNumber, totalPages}) => {
              const isQRCodeEnabled =
                userInfo?.serviceCompany.settings.invoiceQRCodeEnabled;
              const isLastPage = pageNumber === totalPages;

              if (isQRCodeEnabled && isLastPage) {
                return '';
              }

              const adjustedTotalPages = totalPages - (isQRCodeEnabled ? 1 : 0);

              return `${pageNumber} / ${adjustedTotalPages}`;
            }}
          />
        </View>
      </View>

      {footerPath && (
        <View style={styles.imageContainer}>
          <Image
            source={footerPath}
            style={{
              width: footerInfo.width,
              height: footerInfo.height,
              objectFit: 'contain',
              position: 'absolute',
              top: footerInfo.posY,
              left: footerInfo.posX,
              zIndex: 0,
            }}
          />
        </View>
      )}
    </View>
  );
};
export default PdfTemplateFooter;
