import {AddressComponent} from 'models/misc';
import {Text, View, StyleSheet} from '@react-pdf/renderer';
import PdfTemplateBeneficiaryAddress from './PdfTemplateBeneficiaryAddress';

type Props = {
  serviceCompanyInfo?: string;
  receiverName?: string;
  addressComponent?: AddressComponent | null;
  selectedLng?: string;
  translate: (key: string) => string;
  beneficiaryInfo?: AddressComponent | null;
};

const getStyles = (
  boldFontStyle?: {fontFamily: string},
  regularFontStyle?: {fontFamily: string},
) =>
  StyleSheet.create({
    leftAddress: {
      flex: '0 0 53%',
      display: 'flex',
      flexDirection: 'column',
      ...boldFontStyle,
    },
    addressTextWrapper: {
      marginBottom: 13,
    },
    addressText: {
      fontSize: 7,
      ...regularFontStyle,
      flexWrap: 'wrap',
      marginBottom: 2,
      color: '#212121',
      maxWidth: 250,
      marginTop: 2,
    },
    partialAddressText: {
      fontSize: 9,
      marginBottom: 1,
      ...boldFontStyle,
    },
    partAddress: {
      fontSize: 9,
      marginBottom: 4,
    },
  });

const PdfTemplateLeftAddress = ({
  serviceCompanyInfo,
  receiverName,
  addressComponent,
  selectedLng,
  translate,
  beneficiaryInfo,
}: Props) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const regularFontStyle = {
    fontFamily:
      selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
  };

  const styles = getStyles(boldFontStyle, regularFontStyle);

  return (
    <View style={styles.leftAddress}>
      <View style={styles.addressTextWrapper}>
        <Text style={styles.addressText}>{serviceCompanyInfo}</Text>
      </View>

      <View style={styles.partAddress}>
        {receiverName && (
          <Text style={styles.partialAddressText}>{receiverName}</Text>
        )}

        {addressComponent?.street && (
          <Text style={styles.partialAddressText}>
            {addressComponent?.street}
          </Text>
        )}

        {addressComponent?.street2 && (
          <Text style={styles.partialAddressText}>
            {addressComponent?.street2}
          </Text>
        )}

        <Text style={styles.partialAddressText}>
          {addressComponent?.postalCode &&
            `${addressComponent.postalCode}`.trim()}
          {addressComponent?.postalCode &&
            (addressComponent.city || addressComponent.country) &&
            ' '}
          {addressComponent?.city && `${addressComponent.city}`.trim()}
          {addressComponent?.city && addressComponent.country && ', '}
          {addressComponent?.country && `${addressComponent.country}`.trim()}
        </Text>

        <Text style={styles.partialAddressText}>
          {addressComponent?.moreInfo && `${addressComponent.moreInfo}`.trim()}
        </Text>
      </View>

      {(beneficiaryInfo?.name ||
        beneficiaryInfo?.city ||
        beneficiaryInfo?.street) && (
        <PdfTemplateBeneficiaryAddress
          selectedLng={selectedLng}
          translate={translate}
          beneficiaryInfo={beneficiaryInfo}
        />
      )}
    </View>
  );
};

export default PdfTemplateLeftAddress;
