import React from 'react';
import {View, Image, StyleSheet} from '@react-pdf/renderer';

type Props = {
  logoSrc?: string;
  logoDimensions?: {width: number; height: number} | null;
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 100,
  },
});

const PdfTemplateHeader = ({logoSrc, logoDimensions}: Props) => (
  <View style={styles.header} fixed>
    {logoSrc && (
      <Image style={{height: logoDimensions?.height || 35}} source={logoSrc} />
    )}
  </View>
);

export default PdfTemplateHeader;
