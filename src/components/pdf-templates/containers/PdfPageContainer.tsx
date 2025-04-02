import {Font, Page, StyleSheet} from '@react-pdf/renderer';
import React, {PropsWithChildren} from 'react';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';

type Props = {} & Pick<ContextProps, 'fontStyles' | 'primaryColor'>;

const getStyles = ({regularFontStyle, primaryColor}: PdfConfigurationStyles) =>
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
      color: primaryColor,
      paddingTop: 46,
    },
  });

Font.registerHyphenationCallback((word) => ['', word, '']);

const PdfPageContainer = ({
  children,
  fontStyles,
  primaryColor,
}: PropsWithChildren<Props>) => {
  const styles = getStyles({
    regularFontStyle: fontStyles.regular,
    primaryColor,
  });
  return (
    <Page size="A4" style={styles.page}>
      {children}
    </Page>
  );
};

export default PdfPageContainer;
