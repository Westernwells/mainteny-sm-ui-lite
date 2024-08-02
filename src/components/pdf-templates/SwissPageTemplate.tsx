import {Page, View, Image, StyleSheet} from '@react-pdf/renderer';
import React from 'react';

type Props = {
  qrImageSrc: string;
};

const getStyles = () =>
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
      color: '#212121',
    },
    qrCodePage: {
      marginTop: 50,
    },
    qrBorder: {
      border: '1px dashed #656565',
    },
  });

const SwissPageTemplate = ({qrImageSrc}: Props) => {
  const styles = getStyles();
  return (
    <Page style={[styles.page, styles.qrCodePage]}>
      <View style={styles.qrBorder}>
        <Image source={qrImageSrc} />
      </View>
    </Page>
  );
};

export default SwissPageTemplate;
