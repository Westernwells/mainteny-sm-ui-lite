import {AddressComponent} from 'models/misc';
import {StyleSheet, Text, View} from '@react-pdf/renderer';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';

type Props = {
  translate: (key: string) => string;
  beneficiaryInfo?: AddressComponent | null;
} & Pick<ContextProps, 'fontStyles' | 'primaryColor'>;

const getStyles = ({
  regularFontStyle,
  boldFontStyle,
  primaryColor,
}: PdfConfigurationStyles) =>
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
      color: primaryColor,
      maxWidth: 250,
    },
    partialAddressText: {
      fontSize: 9,
      color: primaryColor,
      textAlign: 'left',
      ...regularFontStyle,
      marginTop: 2,
    },
  });

const PdfTemplateBeneficiaryAddress = ({
  translate,
  beneficiaryInfo,
  fontStyles,
  primaryColor,
}: Props) => {
  const styles = getStyles({
    boldFontStyle: fontStyles.bold,
    regularFontStyle: fontStyles.regular,
    primaryColor,
  });

  return (
    <View style={styles.leftAddress}>
      <Text style={styles.addressText}>{translate('Beneficiary Address')}</Text>

      {!!beneficiaryInfo?.name && (
        <Text style={styles.partialAddressText}>{beneficiaryInfo?.name}</Text>
      )}

      {!!beneficiaryInfo?.street && (
        <Text style={styles.partialAddressText}>{beneficiaryInfo?.street}</Text>
      )}

      {!!beneficiaryInfo?.street2 && (
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
