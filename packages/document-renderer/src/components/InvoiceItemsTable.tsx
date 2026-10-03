import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { InvoiceViewModel } from '../domain/createInvoiceViewModel';

interface Props {
  vm: InvoiceViewModel;
  styles: any;
}

export const InvoiceItemsTable: React.FC<Props> = ({ vm, styles }) => {
  const { formattedItems, showHSN, showDiscount, showGST, taxLabel } = vm;

  const colWidths = {
    sr: '6%',
    item: showHSN ? '36%' : '44%',
    hsn: showHSN ? '12%' : '0%',
    qty: '10%',
    rate: '12%',
    discount: showDiscount ? '10%' : '0%',
    tax: showGST ? '8%' : '0%',
    amount: '16%',
  };

  return (
    <View style={styles.table}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { width: colWidths.sr }]}>#</Text>
        <Text style={[styles.tableHeaderCell, { width: colWidths.item }]}>Item & Description</Text>
        {showHSN && <Text style={[styles.tableHeaderCell, { width: colWidths.hsn }]}>HSN/SAC</Text>}
        <Text style={[styles.tableHeaderCell, { width: colWidths.qty, textAlign: 'center' }]}>Qty</Text>
        <Text style={[styles.tableHeaderCell, { width: colWidths.rate, textAlign: 'right' }]}>Rate</Text>
        {showDiscount && <Text style={[styles.tableHeaderCell, { width: colWidths.discount, textAlign: 'right' }]}>Disc</Text>}
        {showGST && <Text style={[styles.tableHeaderCell, { width: colWidths.tax, textAlign: 'right' }]}>{taxLabel}%</Text>}
        <Text style={[styles.tableHeaderCell, { width: colWidths.amount, textAlign: 'right' }]}>Amount</Text>
      </View>

      {/* Rows */}
      {formattedItems.map((item, index) => (
        <View
          key={item.id}
          style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : null]}
          wrap={false}
        >
          <Text style={[styles.tableCell, { width: colWidths.sr }]}>{index + 1}</Text>
          <Text style={[styles.tableCell, { width: colWidths.item, fontWeight: 'bold' }]}>{item.name}</Text>
          {showHSN && <Text style={[styles.tableCell, { width: colWidths.hsn }]}>{item.hsn || '-'}</Text>}
          <Text style={[styles.tableCell, { width: colWidths.qty, textAlign: 'center' }]}>
            {item.quantity} {item.unit}
          </Text>
          <Text style={[styles.tableCell, { width: colWidths.rate, textAlign: 'right' }]}>{item.rate}</Text>
          {showDiscount && <Text style={[styles.tableCell, { width: colWidths.discount, textAlign: 'right' }]}>{item.discount}</Text>}
          {showGST && <Text style={[styles.tableCell, { width: colWidths.tax, textAlign: 'right' }]}>{item.taxPercent}%</Text>}
          <Text style={[styles.tableCell, { width: colWidths.amount, textAlign: 'right', fontWeight: 'bold' }]}>
            {item.amount}
          </Text>
        </View>
      ))}
    </View>
  );
};
