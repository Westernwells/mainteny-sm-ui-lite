import {StyleSheet} from '@react-pdf/renderer';
import {PdfConfigurationStyles} from 'models/pdfs';

export const getStyles = ({
  boldFontStyle,
  primaryColor,
}: PdfConfigurationStyles) =>
  StyleSheet.create({
    dataBody: {
      borderBottom: '1px solid #212121',
      paddingBottom: 5,
    },
    table: {
      width: '100%',
      display: 'flex',
    },
    tableRow: {
      flexDirection: 'row',
      fontSize: 10,
      marginTop: 4,
      width: '100%',
      display: 'flex',
      flexWrap: 'wrap',
    },
    descriptionText: {
      fontSize: 8.5,
      color: primaryColor,
      paddingLeft: 30,
      paddingRight: 5,
      marginVertical: 2,
      width: '94%',
    },
    col6Left: {
      width: '6%',
      wordBreak: 'break-all',
      whiteSpace: 'pre-wrap',
      textAlign: 'left',
      color: primaryColor,
    },
    col37Left: {
      width: '37%',
      textAlign: 'left',
      color: primaryColor,
    },
    col10Right: {
      width: '10%',
      textAlign: 'right',
      color: primaryColor,
    },
    col12Right: {
      width: '12%',
      textAlign: 'right',
      color: primaryColor,
    },
    col11Right: {
      width: '11.5%',
      textAlign: 'right',
      color: primaryColor,
    },
    col10Left: {
      width: '10%',
      textAlign: 'left',
      color: primaryColor,
      paddingLeft: 8,
    },
    col12Left: {
      width: '12%',
      textAlign: 'left',
      color: primaryColor,
      paddingLeft: 8,
    },
    col8Center: {
      width: '8%',
      textAlign: 'center',
      paddingLeft: 8,
      color: primaryColor,
    },
    col8Right: {
      width: '8%',
      textAlign: 'right',
      color: primaryColor,
      paddingRight: 3,
    },
    col13Right: {
      width: '13%',
      textAlign: 'right',
      color: primaryColor,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      fontSize: 10,
      marginVertical: 3,
      color: primaryColor,
    },
    emptyColumn: {
      width: '44%',
    },
    label: {
      width: '32%',
      textAlign: 'right',
    },
    value: {
      width: '24%',
      textAlign: 'right',
    },
    vatContainer: {
      width: '56%',
    },
    vatRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 1,
    },
    vatLabel: {
      width: '57%',
      fontSize: 10,
      textAlign: 'right',
    },
    vatValue: {
      width: '43%',
      fontSize: 10,
      textAlign: 'right',
    },
    totalInclValue: {
      ...boldFontStyle,
    },
  });
