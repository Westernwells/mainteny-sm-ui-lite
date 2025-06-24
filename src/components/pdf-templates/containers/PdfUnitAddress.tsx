import {StyleSheet, Text, View} from '@react-pdf/renderer';
import {Address} from 'models/misc';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';

type Props = {
  translate: (key: string) => string;
  address?: Address;
  building: string;
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

const getStyles = ({
  boldFontStyle,
  regularFontStyle,
  primaryColor,
  secondaryColor,
}: PdfConfigurationStyles) =>
  StyleSheet.create({
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
      flex: '0 0 43%',
    },
    tagContent: {
      fontSize: 8.5,
      color: secondaryColor,
      flex: '0 0 57%',
      textAlign: 'right',
      ...regularFontStyle,
    },
  });

const PdfUnitAddress = ({
  translate,
  address,
  building,
  fontStyles,
  primaryColor,
  secondaryColor,
}: Props) => {
  const styles = getStyles({
    boldFontStyle: fontStyles.bold,
    regularFontStyle: fontStyles.regular,
    primaryColor,
    secondaryColor,
  });
  const hasParsedComponents =
    address?.component?.street ||
    address?.component?.street2 ||
    address?.component?.postalCode ||
    address?.component?.city;

  if (!address?.fullName) return null;

  return (
    <View style={styles.rightAddressContent}>
      <Text style={styles.tag}>{translate('Unit address')}</Text>

      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          ...styles.tagContent,
        }}>
        {!!building && <Text>{building}</Text>}

        {hasParsedComponents ? (
          <>
            {!!address?.component?.street && (
              <Text>{address?.component?.street}</Text>
            )}
            {!!address?.component?.street2 && (
              <Text>{address?.component?.street2}</Text>
            )}
            {!!(address?.component?.postalCode || address?.component?.city) && (
              <Text>
                {address.component.postalCode} {address.component.city}
              </Text>
            )}
          </>
        ) : (
          <Text>{address?.fullName}</Text>
        )}
      </View>
    </View>
  );
};

export default PdfUnitAddress;
