import React from 'react';
import {View, Text, TextProps, ViewProps} from '@react-pdf/renderer';
import {breakEmailAtSign} from 'utils/string';
import {ContextProps} from 'context/PdfStylesProvider';

type Props = {
  email?: string;
  includeEmail?: boolean;
  translate: (key: string) => string;
  styles: {
    container: ViewProps['style'];
    label: TextProps['style'];
    content: TextProps['style'];
  };
} & Pick<ContextProps, 'fontStyles' | 'primaryColor' | 'secondaryColor'>;

export const PdfEmailContent = ({
  email,
  includeEmail,
  translate,
  styles,
}: Props) => {
  if (!includeEmail || !email) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{translate('Email address')}</Text>
      <Text style={styles.content}>{breakEmailAtSign(email)}</Text>
    </View>
  );
};

export default PdfEmailContent;
