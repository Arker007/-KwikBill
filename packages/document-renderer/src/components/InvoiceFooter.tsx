import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { InvoiceViewModel } from '../domain/createInvoiceViewModel';

interface Props {
  vm: InvoiceViewModel;
  styles: any;
}

export const InvoiceFooter: React.FC<Props> = ({ vm, styles }) => {
  const { profile, showSignature } = vm;

  return (
    <View style={styles.footerRow} fixed>
      <Text style={styles.footerText}>
        Thank you for your business! | Generated via GST Billing Application
      </Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
};
