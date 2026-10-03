import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { InvoiceViewModel } from '../domain/createInvoiceViewModel';

interface Props {
  vm: InvoiceViewModel;
  styles: any;
}

export const InvoiceTotals: React.FC<Props> = ({ vm, styles }) => {
  const { totals, formattedTotals, amountInWords, showGST, isInterstate, showSubtotal, showAmountWords, taxLabel } = vm;

  return (
    <View style={styles.totalsContainer} wrap={false}>
      {/* Amount in words */}
      <View style={styles.wordsBox}>
        {showAmountWords && (
          <>
            <Text style={styles.wordsTitle}>Amount in Words:</Text>
            <Text style={styles.wordsText}>{amountInWords}</Text>
          </>
        )}
      </View>

      {/* Totals Breakdown */}
      <View style={styles.totalsBox}>
        {showSubtotal && (
          <View style={styles.totalRow}>
            <Text style={styles.metaLabel}>Subtotal</Text>
            <Text style={styles.metaValue}>{formattedTotals.subtotal}</Text>
          </View>
        )}

        {showGST && !isInterstate && (
          <>
            <View style={styles.totalRow}>
              <Text style={styles.metaLabel}>CGST</Text>
              <Text style={styles.metaValue}>{formattedTotals.cgst}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.metaLabel}>SGST / UTGST</Text>
              <Text style={styles.metaValue}>{totals.utgst > 0 ? formattedTotals.utgst : formattedTotals.sgst}</Text>
            </View>
          </>
        )}

        {showGST && isInterstate && (
          <View style={styles.totalRow}>
            <Text style={styles.metaLabel}>IGST</Text>
            <Text style={styles.metaValue}>{formattedTotals.igst}</Text>
          </View>
        )}

        {totals.cess > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.metaLabel}>Cess</Text>
            <Text style={styles.metaValue}>{formattedTotals.cess}</Text>
          </View>
        )}

        {totals.discount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.metaLabel}>Discount</Text>
            <Text style={styles.metaValue}>-{formattedTotals.discount}</Text>
          </View>
        )}

        {totals.roundOff !== 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.metaLabel}>Round Off</Text>
            <Text style={styles.metaValue}>{formattedTotals.roundOff}</Text>
          </View>
        )}

        <View style={styles.totalRowGrand}>
          <Text style={styles.totalLabelGrand}>Total Amount</Text>
          <Text style={styles.totalValueGrand}>{formattedTotals.total}</Text>
        </View>
      </View>
    </View>
  );
};
