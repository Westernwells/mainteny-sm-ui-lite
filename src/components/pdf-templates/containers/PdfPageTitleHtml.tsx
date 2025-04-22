import {StyleSheet} from '@react-pdf/renderer';
import React from 'react';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';
import {HtmlPDF} from '../../HtmlPDF';

type Props = {
  value?: string;
} & Pick<ContextProps, 'fontStyles' | 'primaryColor'>;

const getStyles = ({boldFontStyle, primaryColor}: PdfConfigurationStyles) =>
  StyleSheet.create({
    contentHeader: {
      fontSize: 14,
      color: primaryColor,
      marginBottom: 5,
      marginTop: 25,
      ...boldFontStyle,
    },
  });

const PdfPageTitleHtml = ({value, fontStyles, primaryColor}: Props) => {
  const styles = getStyles({boldFontStyle: fontStyles.bold, primaryColor});

  if (value && value.trim() !== '')
    return <HtmlPDF html={value || ''} rootStyle={styles} />;
};

export default PdfPageTitleHtml;
