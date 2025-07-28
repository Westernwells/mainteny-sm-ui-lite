import React from 'react';
import {View, Image, StyleSheet} from '@react-pdf/renderer';
import {HeaderFooterInfoData} from 'models/misc';

type Props = {
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
};

const getStyles = () =>
  StyleSheet.create({
    header: {
      height: 86,
      width: 595,
      top: 0,
      left: 0,
      position: 'absolute',
      display: 'flex',
      justifyContent: 'flex-start',
    },
  });

const PdfTemplateHeader = ({headerInfo, headerPath}: Props) => {
  const styles = getStyles();

  return (
    <View style={styles.header}>
      {!!headerPath && (
        <Image
          source={headerPath}
          style={{
            width: headerInfo.width,
            height: headerInfo.height,
            objectFit: 'contain',
            position: 'absolute',
            top: headerInfo.posY,
            left: headerInfo.posX,
          }}
        />
      )}
    </View>
  );
};

export default PdfTemplateHeader;
