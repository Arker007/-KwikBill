import React from 'react';
import { View, Text } from '@react-pdf/renderer';

interface Props {
  copyType?: string;
  styles: any;
}

export const InvoiceCopyLabel: React.FC<Props> = ({ copyType, styles }) => {
  if (!copyType) return null;

  return (
    <View style={{ marginBottom: 4, alignItems: 'flex-end' }}>
      <Text style={styles.copyLabel}>{copyType}</Text>
    </View>
  );
};
