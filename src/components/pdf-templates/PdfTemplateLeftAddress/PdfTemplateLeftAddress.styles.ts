import {StyleSheet} from '@react-pdf/renderer';

export const getStyles = (
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
