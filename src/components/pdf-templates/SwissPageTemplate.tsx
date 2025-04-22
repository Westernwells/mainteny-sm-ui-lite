import {Image, Page, StyleSheet, View} from '@react-pdf/renderer';
import React from 'react';
import {ContextProps} from 'context/PdfStylesProvider';
import {PdfConfigurationStyles} from 'models/pdfs';

type Props = {
  qrImageSrc?: string;
} & Pick<ContextProps, 'primaryColor'>;

const getStyles = ({primaryColor}: PdfConfigurationStyles) =>
  StyleSheet.create({
    page: {
      fontSize: 10,
      paddingTop: 25,
      paddingLeft: 68,
      paddingRight: 45,
      backgroundColor: 'white',
      height: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      justifyContent: 'space-between',
      paddingBottom: 95,
      color: primaryColor,
    },
    qrCodePage: {
      marginTop: 50,
    },
    qrBorder: {
      border: '1px dashed #656565',
    },
  });

const SwissPageTemplate = ({qrImageSrc, primaryColor}: Props) => {
  const styles = getStyles({primaryColor});
  return (
    <Page style={[styles.page, styles.qrCodePage]}>
      <View style={styles.qrBorder}>
        {qrImageSrc ? <Image source={qrImageSrc} /> : null}
      </View>
    </Page>
  );
};

export default SwissPageTemplate;
