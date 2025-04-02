import {StyleSheet} from '@react-pdf/renderer';
import {PdfConfigurationStyles} from 'models/pdfs';

export const getStyles = ({
  primaryColor,
  secondaryColor,
  boldFontStyle,
  regularFontStyle,
}: PdfConfigurationStyles) =>
  StyleSheet.create({
    leftAddress: {
      paddingTop: '20px',
      flex: '0 0 53%',
      display: 'flex',
      flexDirection: 'column',
      color: primaryColor,
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
