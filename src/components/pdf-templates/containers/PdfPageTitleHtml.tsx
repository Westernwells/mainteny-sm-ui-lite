import {StyleSheet, Font} from '@react-pdf/renderer';
import React from 'react';
import NotoSansGeorgianBold from '../../../assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import MontserratBold from '../../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import {HtmlPDF} from '../../HtmlPDF';

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
  value?: string;
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

const PdfPageTitleHtml = ({value, selectedLng}: Props) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const styles = getStyles(boldFontStyle);

  if (value && value.trim() !== '')
    return (
      <HtmlPDF
        html={value || ''}
        rootStyle={styles}
        selectedLng={selectedLng}
      />
    );
};

export default PdfPageTitleHtml;
