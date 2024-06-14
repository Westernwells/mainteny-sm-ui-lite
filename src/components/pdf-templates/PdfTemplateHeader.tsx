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
      height: '86px',
      width: '595px',
      position: 'absolute',
      display: 'flex',
      justifyContent: 'flex-start',
    },
  });

const PdfTemplateHeader = ({headerInfo, headerPath}: Props) => {
  const styles = getStyles();

  return (
    <View style={styles.header}>
      {headerPath && (
        <Image
          source={headerPath}
          style={{
            width: headerInfo.width,
            height: headerInfo.height,
            objectFit: 'contain',
            position: 'absolute',
            top: `${headerInfo.posY}px`,
            left: `${headerInfo.posX}px`,
          }}
        />
      )}
    </View>
  );
};

export default PdfTemplateHeader;
