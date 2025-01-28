import {View, Text, StyleSheet, Font} from '@react-pdf/renderer';
import {Address} from 'models/misc';
import MontserratRegular from '../../../assets/fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratBold from '../../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import MontserratItalic from '../../../assets/fonts/Montserrat/Montserrat-Italic.ttf';
import MontserratBoldItalic from '../../../assets/fonts/Montserrat/Montserrat-BoldItalic.ttf';
import NotoSansGeorgianRegular from '../../../assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from '../../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';

Font.register({
  family: 'Montserrat-Regular',
  fonts: [
    {src: MontserratRegular},
    {src: MontserratBold, fontWeight: 'bold'},
    {src: MontserratItalic, fontStyle: 'italic'},
    {
      src: MontserratBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
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

type Props = {
  translate: (key: string) => string;
  address?: Address;
  selectedLng?: string;
  building: string;
};

const getStyles = (
  boldFontStyle?: {fontFamily: string},
  regularFontStyle?: {fontFamily: string},
) =>
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
      color: '#212121',
      flex: '0 0 43%',
    },
    tagContent: {
      fontSize: 8.5,
      color: '#616161',
      flex: '0 0 57%',
      textAlign: 'right',
      ...regularFontStyle,
    },
  });

const PdfUnitAddress = ({translate, address, selectedLng, building}: Props) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const regularFontStyle = {
    fontFamily:
      selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
  };

  const styles = getStyles(boldFontStyle, regularFontStyle);

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

        {!!address.component?.street && <Text>{address.component.street}</Text>}

        {!!address.component?.street2 && (
          <Text>{address.component.street2}</Text>
        )}

        {!!(address.component?.postalCode || address.component?.city) && (
          <Text>
            {address.component?.postalCode} {address.component?.city}
          </Text>
        )}
      </View>
    </View>
  );
};

export default PdfUnitAddress;
