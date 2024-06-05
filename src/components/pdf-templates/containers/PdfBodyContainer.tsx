import {View, StyleSheet} from '@react-pdf/renderer';
import React, {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

const getStyles = () =>
  StyleSheet.create({
    body: {
      flex: 1,
      marginBottom: 86,
      paddingLeft: 57,
      paddingRight: 35,
    },
  });

const PdfBodyContainer = ({children}: Props) => {
  const styles = getStyles();
  return <View style={styles.body}>{children}</View>;
};

export default PdfBodyContainer;
