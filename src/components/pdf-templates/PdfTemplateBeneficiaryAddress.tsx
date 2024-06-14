import {AddressComponent} from 'models/misc';
import {Text, View, StyleSheet} from '@react-pdf/renderer';

type Props = {
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
      display: 'flex',
      flexDirection: 'column',
      ...boldFontStyle,
    },
    addressText: {
      fontSize: 9,
      ...boldFontStyle,
      flexWrap: 'wrap',
      marginTop: 20,
      color: '#212121',
      maxWidth: 250,
    },
    partialAddressText: {
      fontSize: 9,
      color: '#616161',
      textAlign: 'left',
      ...regularFontStyle,
      marginTop: 2,
    },
  });

const PdfTemplateBeneficiaryAddress = ({
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
      <Text style={styles.addressText}>{translate('Beneficiary Address')}</Text>

      {beneficiaryInfo?.name && (
        <Text style={styles.partialAddressText}>{beneficiaryInfo?.name}</Text>
      )}

      {beneficiaryInfo?.street && (
        <Text style={styles.partialAddressText}>{beneficiaryInfo?.street}</Text>
      )}

      {beneficiaryInfo?.street2 && (
        <Text style={styles.partialAddressText}>
          {beneficiaryInfo?.street2}
        </Text>
      )}

      <Text style={styles.partialAddressText}>
        {`${beneficiaryInfo?.postalCode} ${beneficiaryInfo?.city}`}
      </Text>
    </View>
  );
};

export default PdfTemplateBeneficiaryAddress;
