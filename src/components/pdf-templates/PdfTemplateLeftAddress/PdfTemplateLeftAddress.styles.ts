import {StyleSheet} from '@react-pdf/renderer';
import {PdfConfigurationStyles} from 'models/pdfs';

type Props = {
  isSwissOffset?: boolean;
} & PdfConfigurationStyles;

export const getStyles = ({
  isSwissOffset = false,
  primaryColor,
  secondaryColor,
  boldFontStyle,
  regularFontStyle,
}: Props) =>
  StyleSheet.create({
    leftAddress: {
      paddingTop: '20px', // make offset be about 45mm
      flex: '0 0 53%',
      display: 'flex',
      flexDirection: 'column',
      color: primaryColor,
      ...boldFontStyle,

      ...(isSwissOffset && {
        paddingTop: '50px', // make offset be about 55mm
        paddingLeft: '6px', // make offset be about 22mm
      }),
    },
    addressTextWrapper: {
      marginBottom: 13,
    },
    addressText: {
      fontSize: 7,
      ...regularFontStyle,
      flexWrap: 'wrap',
      marginBottom: 2,
      color: secondaryColor,
      maxWidth: 250,
      marginTop: 2,
    },
    partialAddressText: {
      fontSize: 9,
      marginBottom: 1,
      ...boldFontStyle,
      color: primaryColor,
    },
    partAddress: {
      fontSize: 9,
      marginBottom: 4,
    },
  });
