import {AddressComponent} from 'models/misc';
import {Text, View, StyleSheet} from '@react-pdf/renderer';

type Props = {
  companyName?: string;
  businessAddressName?: string | null;
  receiverName?: string;
  addressComponent?: AddressComponent | null;
  selectedLng?: string;
};

const getStyles = (
  boldFontStyle?: {fontFamily: string},
  regularFontStyle?: {fontFamily: string},
) =>
  StyleSheet.create({
    leftAddress: {
      flex: '0 0 55%',
      display: 'flex',
      flexDirection: 'column',
      ...boldFontStyle,
    },
    addressTextWrapper: {
      marginBottom: 13,
    },
    addressText: {
      fontSize: 8,
      ...regularFontStyle,
      maxWidth: 200,
      flexWrap: 'wrap',
      marginBottom: 2,
      color: '#212121',
    },
    partialAddressText: {
      fontSize: 10,
      marginBottom: 1,
      ...boldFontStyle,
    },
    partAddress: {
      fontSize: 10,
      marginBottom: 4,
    },
  });

const PdfTemplateLeftAddress = ({
  companyName,
  businessAddressName,
  receiverName,
  addressComponent,
  selectedLng,
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
        {' '}
        {companyName && <Text style={styles.addressText}>{companyName}</Text>}
        {businessAddressName && (
          <Text style={styles.addressText}>{businessAddressName}</Text>
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
          {addressComponent?.postalCode && `${addressComponent?.postalCode}`}
          {addressComponent?.state && ` ${addressComponent?.state},`}
          {addressComponent?.country && ` ${addressComponent?.country}`}
        </Text>
      </View>
    </View>
  );
};

export default PdfTemplateLeftAddress;
