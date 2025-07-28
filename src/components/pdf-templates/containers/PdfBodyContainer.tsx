import {View, StyleSheet} from '@react-pdf/renderer';
import React, {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

const getStyles = () =>
  StyleSheet.create({
    body: {
      paddingLeft: 57,
      paddingRight: 35,
      flex: 1,
    },
  });

const PdfBodyContainer = ({children}: Props) => {
  const styles = getStyles();
  return <View style={styles.body}>{children}</View>;
};

export default PdfBodyContainer;
