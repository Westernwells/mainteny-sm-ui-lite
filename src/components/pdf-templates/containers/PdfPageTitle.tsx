import {StyleSheet, Text} from '@react-pdf/renderer';
import React, {PropsWithChildren} from 'react';
import {PdfConfigurationStyles} from 'models/pdfs';
import {ContextProps} from 'context/PdfStylesProvider';

type Props = {} & Pick<ContextProps, 'fontStyles' | 'primaryColor'>;

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

const PdfPageTitle = ({
  children,
  primaryColor,
  fontStyles,
}: PropsWithChildren<Props>) => {
  const styles = getStyles({boldFontStyle: fontStyles.bold, primaryColor});
  return <Text style={styles.contentHeader}>{children}</Text>;
};

export default PdfPageTitle;
