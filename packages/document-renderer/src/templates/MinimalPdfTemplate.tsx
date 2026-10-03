import React from 'react';
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { InvoiceViewModel } from '../domain/createInvoiceViewModel';
import { InvoiceWatermark } from '../components/InvoiceWatermark';

interface Props {
  vm: InvoiceViewModel;
  copyType?: string;
}

export const MinimalPdfTemplate: React.FC<Props> = ({ vm, copyType }) => {
  const {
    profile,
    client,
    details,
    items,
    totals,
    invoiceType,
    customTitle,
    customTerms,
    customNotes,
    sellerCC,
    isInterstate,
    showLogo,
    showDueDate,
    showPlaceOfSupply,
    showBusinessName,
    showBusinessAddress,
    showBusinessPhone,
    showBusinessEmail,
    showGSTIN,
    showBankDetails,
    showUPI,
    showSignature,
    showTerms,
    showNotes,
    showAmountWords,
    upiId,
    account,
    amountInWords,
    extraSections,
    options,
  } = vm;

  const accentColor = vm.accentColor || '#334155';

  const titleText =
    customTitle ||
    (invoiceType === 'quotation'
      ? 'QUOTATION'
      : invoiceType === 'proforma'
        ? 'PROFORMA INVOICE'
        : invoiceType === 'credit-note'
          ? 'CREDIT NOTE'
          : invoiceType === 'bill-of-supply'
            ? 'BILL OF SUPPLY'
            : invoiceType === 'delivery-challan'
              ? 'DELIVERY CHALLAN'
              : 'TAX INVOICE');

  const docNumberLabel =
    invoiceType === 'quotation'
      ? 'No.'
      : invoiceType === 'credit-note'
        ? 'No.'
        : invoiceType === 'proforma'
          ? 'No.'
          : 'No.';

  const docDateLabel =
    invoiceType === 'quotation'
      ? 'Date'
      : invoiceType === 'credit-note'
        ? 'Date'
        : invoiceType === 'proforma'
          ? 'Date'
          : 'Date';

  const bankName = account?.bankName || profile?.bankName || 'Bank of Baroda';
  const accountNo = account?.accountNumber || profile?.accountNumber || '08950200002246';
  const ifsc = account?.ifsc || profile?.ifsc || 'BARBOINDANK';
  const branch = account?.branch || profile?.branch || 'IND.ANKLESHW BRANCH';

  const rawBusinessName = profile?.brandName || profile?.businessName || profile?.companyName || 'VISHAL ENTERPRISE';
  const businessDisplayName = String(rawBusinessName).toUpperCase();

  const totalQty = items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 0), 0);

  const rawCustomerName = details?.customerName || details?.buyerName || client?.name || 'VEER PHARMACHEM';
  const customerName = String(rawCustomerName).toUpperCase();
  const customerAddress =
    details?.customerAddress ||
    [client?.address, client?.city, client?.state, client?.pin].filter(Boolean).join(', ');
  const customerGSTIN = details?.customerGSTIN || client?.gstin || '24AANFV7124M1ZO';
  const customerPhone = client?.phone;

  // Seller address/info fallbacks
  const sellerAddressLine = profile?.address ? (profile.address.toUpperCase().startsWith('PLOT') ? profile.address : 'PLOT NO. ' + profile.address) : 'PLOT NO. 1708/06 , South 9 Road, G.I.D.C,';
  const sellerCityLine = profile?.city || 'Ankleshwar';
  const sellerStatePinLine = [profile?.city ? undefined : 'Bharuch', profile?.state || 'GUJARAT', profile?.pin || '393002'].filter(Boolean).join(', ');
  const sellerPhone = profile?.phone || '+91 9898686379';
  const sellerEmail = profile?.email || 'Info@vishalenterpriseank.com';
  const sellerWebsite = profile?.website || 'www.vishalenterprises.in';

  // Dispatch fallbacks
  const dispatchName = profile?.dispatchName || businessDisplayName;
  const dispatchAddress = profile?.dispatchAddress || (profile?.address ? 'Plot No. ' + profile.address : 'Plot No. 1706/7, GIDC Estate, Ankleshwar');
  const dispatchCityStatePin = [
    profile?.dispatchCity || profile?.city || 'Bharuch',
    profile?.dispatchState || profile?.state || 'GUJARAT',
    profile?.dispatchPin || profile?.pin || '393002'
  ].filter(Boolean).join(', ');

  // Date formatter
  const formatDate = (val?: string) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return val;
    }
  };

  const firstItemTax = items[0]?.taxPercent || 18;
  const halfTax = firstItemTax / 2;

  const fmtNum = (n: number) =>
    (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rowCount = items.length;
  const spacerHeight = Math.max(80, 260 - rowCount * 36);

  const styles = StyleSheet.create({
    page: {
      padding: 20,
      fontFamily: 'Helvetica',
      fontSize: 8,
      color: '#334155',
      backgroundColor: '#ffffff',
    },
    headerMinimal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#cbd5e1',
      paddingBottom: 12,
    },
    headerSeller: {
      maxWidth: 240,
    },
    headerSellerName: {
      fontSize: 9.5,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 3,
    },
    headerSellerText: {
      fontSize: 7.2,
      color: '#4b5563',
      lineHeight: 1.3,
    },
    headerTitleContainer: {
      textAlign: 'right',
    },
    headerTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: accentColor,
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    headerMetaText: {
      fontSize: 7.5,
      color: '#6b7280',
      lineHeight: 1.5,
    },
    partiesContainer: {
      flexDirection: 'row',
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: '#e5e7eb',
    },
    partyCol: {
      flex: 1,
    },
    partyLabel: {
      fontSize: 7.5,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: accentColor,
      marginBottom: 4,
    },
    textSm: {
      fontSize: 7.2,
      lineHeight: 1.3,
      color: '#4b5563',
    },
    textBold: {
      fontWeight: 'bold',
      color: '#1f2937',
    },
    table: {
      marginTop: 15,
      borderWidth: 0.5,
      borderColor: '#e5e7eb',
    },
    tableHeaderRow: {
      flexDirection: 'row',
      backgroundColor: '#f9fafb',
      borderBottomWidth: 0.5,
      borderBottomColor: '#e5e7eb',
    },
    tableHeaderCell: {
      padding: 6,
      fontSize: 7.5,
      fontWeight: 'bold',
      color: '#374151',
      borderRightWidth: 0.5,
      borderRightColor: '#e5e7eb',
    },
    tableRow: {
      flexDirection: 'row',
    },
    itemRow: {
      borderBottomWidth: 0.5,
      borderBottomColor: '#e5e7eb',
    },
    tableCell: {
      padding: 6,
      fontSize: 7.2,
      borderRightWidth: 0.5,
      borderRightColor: '#e5e7eb',
      color: '#4b5563',
    },
    col1: { width: '5%', textAlign: 'center' },
    col2: { width: '40%' },
    col3: { width: '10%', textAlign: 'center' },
    col4: { width: '8%', textAlign: 'center' },
    col5: { width: '10%', textAlign: 'center' },
    col6: { width: '10%', textAlign: 'right' },
    col7: { width: '7%', textAlign: 'center' },
    col8: { width: '10%', textAlign: 'right', borderRightWidth: 0 },
    totalsSection: {
      flexDirection: 'row',
      borderBottomWidth: 0.5,
      borderBottomColor: '#e5e7eb',
    },
    totalsBlank: {
      flex: 1,
      borderRightWidth: 0.5,
      borderRightColor: '#e5e7eb',
    },
    totalsGrid: {
      width: '40%',
    },
    totalsRow: {
      flexDirection: 'row',
      borderBottomWidth: 0.5,
      borderBottomColor: '#f3f4f6',
      paddingVertical: 5,
      paddingHorizontal: 8,
    },
    totalsLabel: {
      width: '60%',
      fontSize: 7.2,
      color: '#4b5563',
    },
    totalsValue: {
      width: '40%',
      textAlign: 'right',
      fontSize: 7.2,
      fontWeight: 'bold',
      color: '#1f2937',
    },
    grandTotalRow: {
      flexDirection: 'row',
      backgroundColor: '#f9fafb',
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    grandTotalLabel: {
      width: '60%',
      fontSize: 7.5,
      fontWeight: 'bold',
      color: '#111827',
    },
    grandTotalValue: {
      width: '40%',
      textAlign: 'right',
      fontSize: 7.5,
      fontWeight: 'bold',
      color: accentColor,
    },
    wordsRow: {
      padding: 10,
      backgroundColor: '#f9fafb',
      borderBottomWidth: 0.5,
      borderBottomColor: '#e5e7eb',
    },
    bottomGrid: {
      flexDirection: 'row',
    },
    bottomLeft: {
      flex: 1.2,
      padding: 10,
      borderRightWidth: 0.5,
      borderRightColor: '#e5e7eb',
    },
    bottomRight: {
      flex: 0.8,
      padding: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });

  return (
    <Page size="A4" style={styles.page}>
      <InvoiceWatermark vm={vm} styles={styles as any} />

      {/* Top Header Section */}
      <View style={styles.headerMinimal}>
        <View style={styles.headerSeller}>
          {showLogo && (options?.logo || profile?.logo) ? (
            <Image
              src={options?.logo || profile?.logo}
              style={{
                height: Number(options?.logoHeight || profile?.logoHeight || 36),
                width: 120,
                objectFit: 'contain',
                marginBottom: 4,
              }}
            />
          ) : null}
          {showBusinessName && (
            <Text style={styles.headerSellerName}>{businessDisplayName}</Text>
          )}
          <View style={{ gap: 1 }}>
            {showBusinessAddress && (
              <>
                <Text style={styles.headerSellerText}>{sellerAddressLine}</Text>
                <Text style={styles.headerSellerText}>{sellerCityLine}, {sellerStatePinLine}</Text>
              </>
            )}
            {showGSTIN && profile?.gstin ? (
              <Text style={styles.headerSellerText}>GSTIN: {profile.gstin}</Text>
            ) : null}
            {showBusinessPhone && (
              <Text style={styles.headerSellerText}>Mobile: {sellerPhone}</Text>
            )}
            {showBusinessEmail && (
              <Text style={styles.headerSellerText}>Email: {sellerEmail}</Text>
            )}
            <Text style={styles.headerSellerText}>Website: {sellerWebsite}</Text>
          </View>
        </View>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{titleText}</Text>
          <View style={{ gap: 1 }}>
            <Text style={styles.headerMetaText}>
              <Text style={{ fontWeight: 'bold' }}>Invoice No: </Text>
              {details?.invoiceNumber || '-'}
            </Text>
            <Text style={styles.headerMetaText}>
              <Text style={{ fontWeight: 'bold' }}>Invoice Date: </Text>
              {formatDate(details?.invoiceDate) || '06 Sep 2026'}
            </Text>
            {showDueDate && details?.dueDate ? (
              <Text style={styles.headerMetaText}>
                <Text style={{ fontWeight: 'bold' }}>Due Date: </Text>
                {formatDate(details.dueDate)}
              </Text>
            ) : null}
            {details?.placeOfSupply ? (
              <Text style={styles.headerMetaText}>
                <Text style={{ fontWeight: 'bold' }}>POS: </Text>
                {details.placeOfSupply}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Parties Section */}
      <View style={styles.partiesContainer}>
        <View style={styles.partyCol}>
          <Text style={styles.partyLabel}>Customer Details</Text>
          <Text style={[styles.textSm, styles.textBold, { fontSize: 8, marginBottom: 2 }]}>
            {customerName}
          </Text>
          {customerGSTIN ? (
            <Text style={[styles.textSm, styles.textBold]}>GSTIN: {customerGSTIN}</Text>
          ) : null}
          <Text style={styles.textSm}>Billing Address:</Text>
          {customerAddress ? (
            <Text style={styles.textSm}>{customerAddress}</Text>
          ) : (
            <>
              <Text style={styles.textSm}>PLOT NO.39, JHAGADIA INDUSTRIAL ESTATE</Text>
              <Text style={styles.textSm}>GIDC, JHAGADIA</Text>
              <Text style={styles.textSm}>Bharuch, GUJARAT, 393110</Text>
            </>
          )}
          {customerPhone ? <Text style={styles.textSm}>Mobile: {customerPhone}</Text> : null}
        </View>
        <View style={[styles.partyCol, { paddingLeft: 20 }]}>
          <Text style={styles.partyLabel}>Dispatch Details</Text>
          <Text style={[styles.textSm, styles.textBold, { fontSize: 8, marginBottom: 2 }]}>
            {dispatchName}
          </Text>
          <Text style={styles.textSm}>{dispatchAddress}</Text>
          <Text style={styles.textSm}>{dispatchCityStatePin}</Text>
        </View>
      </View>

      {/* Table */}
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.col1]}>#</Text>
          <Text style={[styles.tableHeaderCell, styles.col2]}>Item</Text>
          <Text style={[styles.tableHeaderCell, styles.col3]}>HSN/SAC</Text>
          <Text style={[styles.tableHeaderCell, styles.col4]}>Tax</Text>
          <Text style={[styles.tableHeaderCell, styles.col5]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, styles.col6]}>Rate / Item</Text>
          <Text style={[styles.tableHeaderCell, styles.col7]}>Per</Text>
          <Text style={[styles.tableHeaderCell, styles.col8]}>Amount</Text>
        </View>

        {items.map((item: any, idx: number) => {
          const qty = Number(item.quantity) || 0;
          const rate = Number(item.rate) || 0;
          const lineAmount = qty * rate;

          // Resolve discount from item
          const discountPercent = item.discountType === 'percent' ? Number(item.discount) || 0 : 0;
          const discountFixed = item.discountType === 'fixed' || !item.discountType ? Number(item.discount) || 0 : 0;

          let discount = 0;
          if (item.discountType === 'percent') {
            discount = lineAmount * (discountPercent / 100);
          } else if (item.discountType === 'fixed') {
            discount = discountFixed;
          } else if (item.discountType === 'unit') {
            discount = discountFixed * qty;
          } else if (item.discountType === 'gross') {
            discount = discountFixed;
          }
          if (!discount && Number(item.discount) > 0) {
            discount = Number(item.discount);
          }

          const grossAfterDiscount = Math.max(0, lineAmount - discount);
          const taxRate = item.taxPercent || 0;
          const isTaxInclusive = totals.taxInclusive;
          const afterDiscount = isTaxInclusive
            ? grossAfterDiscount / (1 + taxRate / 100)
            : grossAfterDiscount;
          const unit = item.unit || 'NOS';

          return (
            <View key={item.id || idx} style={[styles.tableRow, styles.itemRow]} wrap={false}>
              <Text style={[styles.tableCell, styles.col1]}>{idx + 1}</Text>
              <View style={[styles.tableCell, styles.col2]}>
                <Text style={styles.textBold}>{item.name || '-'}</Text>
                {item.description ? (
                  <Text style={{ fontSize: 6.2, fontWeight: 'normal', marginTop: 1, color: '#6b7280' }}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.tableCell, styles.col3]}>{item.hsn || '-'}</Text>
              <Text style={[styles.tableCell, styles.col4]}>{taxRate ? `${taxRate}%` : '-'}</Text>
              <Text style={[styles.tableCell, styles.col5]}>{qty} {unit}</Text>
              <Text style={[styles.tableCell, styles.col6, styles.textBold]}>{fmtNum(rate)}</Text>
              <Text style={[styles.tableCell, styles.col7]}>{unit}</Text>
              <Text style={[styles.tableCell, styles.col8, styles.textBold]}>{fmtNum(afterDiscount)}</Text>
            </View>
          );
        })}

        {/* Vertical Fill Height Spacer Row */}
        <View style={[styles.tableRow, styles.itemRow, { height: spacerHeight }]} wrap={false}>
          <View style={[styles.tableCell, styles.col1, { height: '100%' }]}></View>
          <View style={[styles.tableCell, styles.col2, { height: '100%' }]}></View>
          <View style={[styles.tableCell, styles.col3, { height: '100%' }]}></View>
          <View style={[styles.tableCell, styles.col4, { height: '100%' }]}></View>
          <View style={[styles.tableCell, styles.col5, { height: '100%' }]}></View>
          <View style={[styles.tableCell, styles.col6, { height: '100%' }]}></View>
          <View style={[styles.tableCell, styles.col7, { height: '100%' }]}></View>
          <View style={[styles.tableCell, styles.col8, { borderRightWidth: 0, height: '100%' }]}></View>
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection} wrap={false}>
          <View style={styles.totalsBlank}></View>
          <View style={styles.totalsGrid}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Taxable Amount</Text>
              <Text style={styles.totalsValue}>{fmtNum(totals.taxableAmount || 0)}</Text>
            </View>

            {isInterstate ? (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>IGST {firstItemTax}%</Text>
                <Text style={styles.totalsValue}>{fmtNum(totals.igst || 0)}</Text>
              </View>
            ) : (
              <>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>CGST {halfTax}%</Text>
                  <Text style={styles.totalsValue}>{fmtNum(totals.cgst || 0)}</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>SGST {halfTax}%</Text>
                  <Text style={styles.totalsValue}>{fmtNum(totals.sgst || 0)}</Text>
                </View>
              </>
            )}

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{fmtNum(totals.total || 0)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Amount in words */}
      {showAmountWords && amountInWords ? (
        <View style={styles.wordsRow} wrap={false}>
          <Text style={[styles.textSm, { color: '#4b5563' }]}>
            <Text style={{ fontWeight: 'bold' }}>Total amount (in words): </Text>
            {amountInWords}
          </Text>
        </View>
      ) : null}

      {/* Bottom section (Bank details + Signatory) */}
      <View style={styles.bottomGrid} wrap={false}>
        <View style={styles.bottomLeft}>
          {showBankDetails ? (
            <View style={{ gap: 2 }}>
              <Text style={[styles.textSm, styles.textBold, { fontSize: 7.5, color: accentColor }]}>
                Bank Details:
              </Text>
              <Text style={styles.textSm}>Bank: {bankName}</Text>
              <Text style={styles.textSm}>Account #: {accountNo}</Text>
              <Text style={styles.textSm}>IFSC Code: {ifsc}</Text>
              <Text style={styles.textSm}>Branch: {branch}</Text>
              <Text style={[styles.textSm, styles.textBold, { marginTop: 4 }]}>
                {businessDisplayName}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.bottomRight}>
          <Text style={styles.textSm}>For {businessDisplayName}</Text>
          {showSignature ? (
            <Text style={[styles.textSm, { color: '#9ca3af', marginVertical: 8, fontStyle: 'italic' }]}>
              [Authorized Signature]
            </Text>
          ) : null}
          <Text style={[styles.textSm, styles.textBold]}>Authorized Signatory</Text>
        </View>
      </View>

      {/* Terms & Conditions */}
      {showTerms && (customTerms || (profile?.termsAndConditions && profile.termsAndConditions.length > 0)) ? (
        <View style={{ marginTop: 10, padding: 10, borderTopWidth: 0.5, borderTopColor: '#e5e7eb' }} wrap={false}>
          <Text style={[styles.textSm, styles.textBold, { color: accentColor, marginBottom: 2 }]}>
            Terms and Conditions:
          </Text>
          {customTerms ? (
            <Text style={styles.textSm}>{customTerms}</Text>
          ) : (
            profile?.termsAndConditions?.map((term: string, idx: number) => (
              <Text key={idx} style={styles.textSm}>
                {idx + 1}. {term}
              </Text>
            ))
          )}
        </View>
      ) : null}
    </Page>
  );
};
