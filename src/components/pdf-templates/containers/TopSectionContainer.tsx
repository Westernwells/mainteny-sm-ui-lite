import {View, StyleSheet} from '@react-pdf/renderer';
import React, {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

const getStyles = () =>
  StyleSheet.create({
    topSection: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 35,
      paddingTop: 60,
    },
  });

const TopSectionContainer = ({children}: Props) => {
  const styles = getStyles();
  return <View style={styles.topSection}>{children}</View>;
};

export default TopSectionContainer;
