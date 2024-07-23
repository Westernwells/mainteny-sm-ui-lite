import {StyleSheet} from '@react-pdf/renderer';

export const getStyles = () =>
  StyleSheet.create({
    dataBody: {
      borderBottom: '1px solid #212121',
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
    tableRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'baseline',
      fontSize: 10,
      marginVertical: 4,
    },
    descriptionText: {
      width: '37%',
      display: 'flex',
      fontSize: 8.5,
      color: '#212121',
      paddingLeft: 20,
      letterSpacing: -0.15,
      marginVertical: 4,
      lineHeight: 1.5,
    },
  });
