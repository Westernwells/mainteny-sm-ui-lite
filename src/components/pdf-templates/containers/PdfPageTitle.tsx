import {View, StyleSheet, Font} from '@react-pdf/renderer';
import React, {ReactNode} from 'react';
import NotoSansGeorgianBold from '../../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import MontserratBold from '../../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';

Font.register({
  family: 'Montserrat-Bold',
  format: 'truetype',
  src: MontserratBold,
});

Font.register({
  family: 'NotoSans-Bold',
  format: 'truetype',
  src: NotoSansGeorgianBold,
});

type Props = {
  children: ReactNode;
  selectedLng?: string;
};

const getStyles = (boldFontStyle?: {fontFamily: string}) =>
  StyleSheet.create({
    contentHeader: {
      fontSize: 14,
      color: '#212121',
      marginBottom: 5,
      marginTop: 25,
      ...boldFontStyle,
    },
  });

const PdfPageTitle = ({children, selectedLng}: Props) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const styles = getStyles(boldFontStyle);
  return <View style={styles.contentHeader}>{children}</View>;
};

export default PdfPageTitle;
