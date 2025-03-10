import {Page, StyleSheet, Font} from '@react-pdf/renderer';
import React, {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  selectedLng?: string;
};

const getStyles = (regularFontStyle?: {fontFamily: string}) =>
  StyleSheet.create({
    page: {
      ...regularFontStyle,
      fontSize: 10,
      backgroundColor: 'white',
      height: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      paddingBottom: 95,
      color: '#212121',
      paddingTop: 46,
    },
  });

Font.registerHyphenationCallback((word) => ['', word, '']);

const PdfPageContainer = ({children, selectedLng}: Props) => {
  const regularFontStyle = {
    fontFamily:
      selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
  };

  const styles = getStyles(regularFontStyle);
  return (
    <Page size="A4" style={styles.page}>
      {children}
    </Page>
  );
};

export default PdfPageContainer;
