import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { InvoiceViewModel } from '../domain/createInvoiceViewModel';

interface Props {
  vm: InvoiceViewModel;
  styles: any;
}

export const InvoiceTerms: React.FC<Props> = ({ vm, styles }) => {
  const { customTerms, customNotes, showTerms, showNotes, account, showBankDetails, profile } = vm;

  if (!showTerms && !showNotes && !showBankDetails) return null;

  return (
    <View style={styles.termsBox} wrap={false}>
      {showBankDetails && account && (
        <View style={{ marginBottom: 6 }}>
          <Text style={styles.termsTitle}>Bank & Payment Details:</Text>
          <Text style={styles.termsText}>
            Bank: {account.bankName || 'N/A'} | A/C: {account.accountNumber || 'N/A'} | IFSC: {account.ifscCode || 'N/A'}
          </Text>
          {account.branchName && (
            <Text style={styles.termsText}>Branch: {account.branchName}</Text>
          )}
        </View>
      )}

      {showNotes && customNotes && (
        <View style={{ marginBottom: 6 }}>
          <Text style={styles.termsTitle}>Notes / Remarks:</Text>
          <Text style={styles.termsText}>{customNotes}</Text>
        </View>
      )}

      {showTerms && customTerms && (
        <View>
          <Text style={styles.termsTitle}>Terms & Conditions:</Text>
          <Text style={styles.termsText}>{customTerms}</Text>
        </View>
      )}
    </View>
  );
};
