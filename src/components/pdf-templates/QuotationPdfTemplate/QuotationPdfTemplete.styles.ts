import {PdfConfigurationStyles} from 'models/pdfs';
import {StyleSheet} from '@react-pdf/renderer';

type Props = {
  isSwissOffset?: boolean;
} & PdfConfigurationStyles;

export const getStyles = ({
  boldFontStyle,
  regularFontStyle,
  primaryColor,
  secondaryColor,
  isSwissOffset = false,
}: Props) =>
  StyleSheet.create({
    rightAddress: {
      paddingTop: '20px',
      flex: '0 0 42%',
      display: 'flex',
      flexDirection: 'column',
      ...(isSwissOffset && {
        paddingTop: '50px', // make offset be about 55mm
        paddingLeft: '6px', // make offset be about 22mm
      }),
    },
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
    dataBody: {
      borderBottom: '1px solid #212121',
      paddingBottom: 10,
    },
    paymentTermsSection: {
      marginTop: 1,
    },
    notesSection: {
      marginTop: 30,
    },
    sectionHeading: {
      fontSize: 10,
      padding: 0,
      lineHeight: 0,
      marginBottom: 6,
      color: primaryColor,
      ...boldFontStyle,
      marginTop: 15,
    },
    sectionBody: {
      fontSize: 10,
      color: secondaryColor,
      display: 'flex',
      flexDirection: 'column',
      paddingVertical: 1.5,
    },
    table: {
      width: '100%',
      display: 'flex',
    },
    tableHead: {
      display: 'flex',
      flexDirection: 'row',
      paddingTop: 3,
    },
    tableHeading: {
      color: primaryColor,
      display: 'flex',
      fontSize: 6,
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      fontSize: 10,
      marginVertical: 4,
      width: '100%',
      display: 'flex',
      flexWrap: 'wrap',
    },
    descriptionText: {
      fontSize: 8.5,
      color: secondaryColor,
      paddingLeft: 30,
      paddingRight: 5,
      marginVertical: 2,
    },
    signatureBoxWrap: {
      marginTop: 30,
    },
    signatureBox: {
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #E4E9F2',
      borderRadius: '8px',
      marginTop: 5,
      maxWidth: 270,
      height: 50,
      textAlign: 'center',
      justifyContent: 'space-around',
      position: 'relative',
    },
    signatureText: {
      position: 'absolute',
      bottom: -5,
      left: '16%',
      backgroundColor: 'white',
      padding: 1,
      ...boldFontStyle,
    },
  });
