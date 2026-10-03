import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { InvoiceViewModel } from '../domain/createInvoiceViewModel';

interface Props {
  vm: InvoiceViewModel;
}

export const ThermalPdfTemplate: React.FC<Props> = ({ vm }) => {
  const { profile, client, details, formattedItems, formattedTotals, paperCfg } = vm;
  const widthMm = paperCfg?.widthMm || 80;
  const widthPt = widthMm * 2.83465;
  const heightPt = 800; // flowing receipt page

  const styles = StyleSheet.create({
    page: {
      padding: 10,
      width: widthPt,
      fontFamily: 'Courier',
      fontSize: widthMm <= 58 ? 7 : 8,
      backgroundColor: '#ffffff',
    },
    header: {
      textAlign: 'center',
      marginBottom: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: '#000000',
      paddingBottom: 4,
    },
    title: {
      fontWeight: 'bold',
      fontSize: widthMm <= 58 ? 9 : 10,
    },
    detail: {
      fontSize: widthMm <= 58 ? 6 : 7,
      marginTop: 1,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 1,
    },
    divider: {
      borderBottomWidth: 0.5,
      borderBottomColor: '#000000',
      marginVertical: 4,
    },
    bold: {
      fontWeight: 'bold',
    },
  });

  return (
    <Page size={[widthPt, heightPt]} style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{profile?.businessName || 'RECEIPT'}</Text>
        {profile?.address && <Text style={styles.detail}>{profile.address}</Text>}
        {profile?.phone && <Text style={styles.detail}>Ph: {profile.phone}</Text>}
        {profile?.gstin && <Text style={styles.detail}>GSTIN: {profile.gstin}</Text>}
      </View>

      <View style={styles.row}>
        <Text>Inv: {details?.invoiceNumber || 'DRAFT'}</Text>
        <Text>{details?.invoiceDate || ''}</Text>
      </View>

      <View style={styles.row}>
        <Text>To: {client?.name || 'Cash Customer'}</Text>
      </View>

      <View style={styles.divider} />

      {formattedItems.map((item, idx) => (
        <View key={item.id || idx} style={{ marginBottom: 2 }}>
          <Text style={styles.bold}>{item.name}</Text>
          <View style={styles.row}>
            <Text>{item.quantity} x {item.rate}</Text>
            <Text>{item.amount}</Text>
          </View>
        </View>
      ))}

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text>Subtotal:</Text>
        <Text>{formattedTotals.subtotal}</Text>
      </View>
      <View style={styles.row}>
        <Text>Tax:</Text>
        <Text>{formattedTotals.totalTax}</Text>
      </View>
      <View style={[styles.row, { marginTop: 2 }]}>
        <Text style={styles.bold}>TOTAL:</Text>
        <Text style={styles.bold}>{formattedTotals.total}</Text>
      </View>

      <View style={[styles.divider, { marginTop: 8 }]} />
      <Text style={{ textAlign: 'center', fontSize: 6, marginTop: 4 }}>
        Thank You! Visit Again
      </Text>
    </Page>
  );
};
