import {AddressComponent} from 'models/misc';
import {Text, View, StyleSheet} from '@react-pdf/renderer';
import PdfTemplateBeneficiaryAddress from './PdfTemplateBeneficiaryAddress';

type Props = {
  companyName?: string;
  billingAddressName?: string | null;
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
      flex: '0 0 58%',
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
  companyName,
  billingAddressName,
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

  const combinedText = companyName
    ? `${companyName}, ${billingAddressName}`
    : `${billingAddressName}`;
  const maxLength = 65;

  return (
    <View style={styles.leftAddress}>
      <View style={styles.addressTextWrapper}>
        {combinedText.length <= maxLength ? (
          <Text style={styles.addressText}>{combinedText}</Text>
        ) : (
          <>
            <Text style={styles.addressText}>{companyName}</Text>
            <Text style={styles.addressText}>{billingAddressName}</Text>
          </>
        )}
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
          {addressComponent?.postalCode && `${addressComponent.postalCode}`}
          {addressComponent?.postalCode &&
            (addressComponent.city || addressComponent.country) &&
            ' '}
          {addressComponent?.city && `${addressComponent.city}`}
          {addressComponent?.city && addressComponent.country && ', '}
          {addressComponent?.country && `${addressComponent.country}`}
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
