import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { InvoiceViewModel } from '../domain/createInvoiceViewModel';

interface Props {
  vm: InvoiceViewModel;
  styles: any;
  copyType?: string;
}

export const InvoiceWatermark: React.FC<Props> = ({ vm, styles }) => {
  const { printSettings } = vm;
  if (!printSettings?.watermarkEnabled) return null;

  const text = printSettings.watermarkUseCustomText
    ? printSettings.watermarkCustomText || 'ORIGINAL'
    : printSettings.watermarkText || 'ORIGINAL';

  if (!text) return null;

  return (
    <View style={styles.watermark} fixed>
      <Text>{String(text).toUpperCase()}</Text>
    </View>
  );
};
