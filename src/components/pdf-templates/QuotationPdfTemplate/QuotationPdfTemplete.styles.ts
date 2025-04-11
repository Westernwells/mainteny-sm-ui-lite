import {PdfConfigurationStyles} from 'models/pdfs';
import {StyleSheet} from '@react-pdf/renderer';

export const getStyles = ({
  boldFontStyle,
  regularFontStyle,
  primaryColor,
  secondaryColor,
}: PdfConfigurationStyles) =>
  StyleSheet.create({
    rightAddress: {
      flex: '0 0 42%',
      display: 'flex',
      flexDirection: 'column',
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
      paddingVertical: 4,
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
    col2Left: {
      width: '6%',
      wordBreak: 'break-all',
      whiteSpace: 'pre-wrap',
      textAlign: 'left',
      color: secondaryColor,
    },
    col40Left: {
      width: '37%',
      textAlign: 'left',
      color: secondaryColor,
    },
    col10Right: {
      width: '10%',
      textAlign: 'right',
      color: secondaryColor,
    },
    col8Center: {
      width: '8%',
      textAlign: 'center',
      marginLeft: 10,
      color: secondaryColor,
    },
    col15Right: {
      width: '13%',
      textAlign: 'right',
      color: secondaryColor,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      fontSize: 10,
      marginVertical: 3,
      color: primaryColor,
    },
  });
