import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { InvoiceViewModel } from '../domain/createInvoiceViewModel';

interface Props {
  vm: InvoiceViewModel;
  styles: any;
}

export const InvoiceParties: React.FC<Props> = ({ vm, styles }) => {
  const { client, details, showClientAddress, showClientPhone, showClientEmail, showGSTIN, taxLabel, showInvoiceNumber, showInvoiceDate, showDueDate, formattedDate, formattedDueDate, invoiceNumber } = vm;

  return (
    <View style={styles.partiesContainer}>
      <View style={styles.partyBox}>
        <Text style={styles.partyTitle}>Billed To:</Text>
        <Text style={styles.partyName}>{client?.name || 'Cash Customer'}</Text>
        {showClientAddress && (client?.address || client?.city) && (
          <Text style={styles.partyText}>
            {[client.address, client.city, client.state, client.pin].filter(Boolean).join(', ')}
          </Text>
        )}
        {(showClientPhone && client?.phone) || (showClientEmail && client?.email) ? (
          <Text style={styles.partyText}>
            {[showClientPhone && client.phone, showClientEmail && client.email].filter(Boolean).join(' | ')}
          </Text>
        ) : null}
        {showGSTIN && client?.gstin && (
          <Text style={styles.partyText}>{taxLabel}IN: {client.gstin}</Text>
        )}
      </View>

      <View style={styles.metaBox}>
        {showInvoiceNumber && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Invoice No:</Text>
            <Text style={styles.metaValue}>{invoiceNumber}</Text>
          </View>
        )}
        {showInvoiceDate && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date:</Text>
            <Text style={styles.metaValue}>{formattedDate}</Text>
          </View>
        )}
        {showDueDate && formattedDueDate ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Due Date:</Text>
            <Text style={styles.metaValue}>{formattedDueDate}</Text>
          </View>
        ) : null}
        {details?.placeOfSupply ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Place of Supply:</Text>
            <Text style={styles.metaValue}>{details.placeOfSupply}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};
