import React from 'react';
import { Page, View, Text, Image, Svg, Path, StyleSheet } from '@react-pdf/renderer';
import { InvoiceViewModel } from '../domain/createInvoiceViewModel';
import { InvoiceWatermark } from '../components/InvoiceWatermark';

interface Props {
  vm: InvoiceViewModel;
  copyType?: string;
}

export const ExactPdfTemplate: React.FC<Props> = ({ vm, copyType }) => {
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
      ? 'Quotation #:'
      : invoiceType === 'credit-note'
        ? 'Credit Note #:'
        : invoiceType === 'proforma'
          ? 'Proforma #:'
          : 'Invoice #:';

  const docDateLabel =
    invoiceType === 'quotation'
      ? 'Quotation Date:'
      : invoiceType === 'credit-note'
        ? 'Credit Note Date:'
        : invoiceType === 'proforma'
          ? 'Proforma Date:'
          : 'Invoice Date:';

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
  const sellerAddressLine = profile?.address ? `PLOT NO. ${profile.address}` : 'PLOT NO. 1706/06 , South 9 Road, G.I.D.C,';
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
  const isIndia = (profile?.country || 'India') === 'India';

  const fmtNum = (n: number) =>
    (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rowCount = items.length;
  const spacerHeight = Math.max(80, 260 - rowCount * 36);

  const styles = StyleSheet.create({
    page: {
      paddingVertical: '8mm',
      paddingHorizontal: '10mm',
      fontFamily: 'Helvetica',
      fontSize: 7.875,
      color: '#000000',
      backgroundColor: '#ffffff',
    },
    outerBox: {
      borderWidth: 0.75,
      borderColor: '#000000',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 0.375,
      borderBottomColor: '#000000',
      paddingVertical: 3,
      paddingHorizontal: 9,
    },
    headerTitle: {
      fontSize: 11.25,
      fontWeight: 'bold',
      color: '#1E61EB',
      letterSpacing: 2.25,
      textAlign: 'center',
      width: '66.6667%',
    },
    copyLabelText: {
      fontSize: 6.75,
      fontWeight: 'bold',
      color: '#000000',
      width: '16.6667%',
      textAlign: 'right',
    },
    gridRow: {
      flexDirection: 'row',
      borderBottomWidth: 0.375,
      borderBottomColor: '#000000',
    },
    leftCol: {
      width: '50%',
      borderRightWidth: 0.375,
      borderRightColor: '#000000',
    },
    rightCol: {
      width: '50%',
    },
    sellerBox: {
      padding: 6,
      borderBottomWidth: 0.375,
      borderBottomColor: '#000000',
      flexDirection: 'row',
      gap: 9,
    },
    logoImage: {
      width: 60,
      height: 45,
      objectFit: 'contain',
    },
    textBold: {
      fontWeight: 'bold',
    },
    textSm: {
      fontSize: 7.875,
      lineHeight: 1.3,
    },
    textMd: {
      fontSize: 8.625,
      lineHeight: 1.3,
    },
    customerBox: {
      padding: 6,
    },
    metaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      borderBottomWidth: 0.375,
      borderBottomColor: '#000000',
    },
    metaCell: {
      width: '50%',
      paddingTop: 4.5,
      paddingRight: 4.5,
      paddingBottom: 4.5,
      paddingLeft: 6,
      borderBottomWidth: 0.375,
      borderBottomColor: '#000000',
      borderRightWidth: 0.375,
      borderRightColor: '#000000',
    },
    metaValue: {
      fontSize: 8.25,
      lineHeight: 1.3,
      fontWeight: 'bold',
      marginTop: 1.5,
    },
    dispatchBox: {
      padding: 6,
      flex: 1,
    },
    table: {
      width: '100%',
    },
    tableHeaderRow: {
      flexDirection: 'row',
      borderBottomWidth: 0.375,
      borderBottomColor: '#000000',
      backgroundColor: '#ffffff',
    },
    tableHeaderCell: {
      fontSize: 7.875,
      lineHeight: 1.25,
      fontWeight: 'bold',
      paddingTop: 4.5,
      paddingRight: 3,
      paddingBottom: 3.75,
      paddingLeft: 3,
      borderRightWidth: 0.375,
      borderRightColor: '#000000',
    },
    tableRow: {
      flexDirection: 'row',
    },
    tableCell: {
      fontSize: 7.875,
      lineHeight: 1.3,
      paddingTop: 4.5,
      paddingRight: 3,
      paddingBottom: 3,
      paddingLeft: 3,
      borderRightWidth: 0.375,
      borderRightColor: '#000000',
    },
    itemName: {
      fontSize: 8.25,
      fontWeight: 'bold',
    },
    itemDescription: {
      fontSize: 7.875,
      fontWeight: 'normal',
      marginTop: 1.5,
      color: '#000000',
    },
    summaryCell: {
      fontSize: 8.25,
      lineHeight: 1.3,
      paddingVertical: 1.5,
      borderRightWidth: 0.375,
      borderRightColor: '#000000',
    },
    summaryLabel: {
      fontWeight: 'bold',
      fontStyle: 'italic',
      textAlign: 'right',
      paddingRight: 6,
    },
    summaryAmount: {
      fontWeight: 'bold',
      textAlign: 'right',
      paddingRight: 4.5,
      borderRightWidth: 0,
    },
    col1: { width: '3.5%', textAlign: 'center' },
    col2: { width: '42.5%' },
    col3: { width: '9.0%', textAlign: 'center' },
    col4: { width: '5.0%', textAlign: 'center' },
    col5: { width: '10.0%', textAlign: 'center' },
    col6: { width: '11.5%', textAlign: 'right' },
    col7: { width: '4.5%', textAlign: 'center' },
    col8: { width: '14.0%', textAlign: 'right', borderRightWidth: 0 },
    wordsBox: {
      paddingTop: 4.5,
      paddingRight: 4.5,
      paddingBottom: 4.5,
      paddingLeft: 6,
      borderBottomWidth: 0.375,
      borderBottomColor: '#000000',
      fontSize: 7.875,
    },
    footerGrid: {
      flexDirection: 'row',
    },
    bankBox: {
      width: '66.6667%',
      borderRightWidth: 0.375,
      borderRightColor: '#000000',
      padding: 6,
      justifyContent: 'space-between',
      minHeight: 82.5,
    },
    signBox: {
      width: '33.3333%',
      padding: 6,
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      minHeight: 82.5,
    },
    signTop: {
      fontSize: 7.125,
      color: '#4b5563',
      letterSpacing: 0.2,
    },
    signBottom: {
      fontSize: 7.5,
      color: '#4b5563',
    },
    termsBox: {
      padding: 6,
      fontSize: 7.5,
      borderTopWidth: 0.375,
      borderTopColor: '#000000',
      backgroundColor: '#ffffff',
    },
  });

  return (
    <Page size="A4" style={styles.page}>
      <InvoiceWatermark vm={vm} styles={styles} />

      <View style={styles.outerBox}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={{ width: '16.6667%' }} />
          <Text style={styles.headerTitle}>{titleText}</Text>
          <Text style={styles.copyLabelText}>{copyType || 'ORIGINAL FOR RECIPIENT'}</Text>
        </View>

        {/* Company & Customer Split Grid */}
        <View style={styles.gridRow}>
          {/* Left Column */}
          <View style={styles.leftCol}>
            {/* Seller */}
            <View style={styles.sellerBox}>
              {showLogo && (
                <View style={{ width: 58.5, paddingTop: 3 }}>
                  {options?.logo || profile?.logo ? (
                    <Image
                      src={options?.logo || profile?.logo}
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: Number(options?.logoHeight || profile?.logoHeight || 60) * 0.75,
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <Svg viewBox="0 0 160 120" style={{ width: '100%', height: 'auto' }}>
                      <Path d="M 5,5 L 38,92 L 56,10 L 42,10 L 38,65 L 20,5 Z" fill="#1b4d3e" />
                      <Path d="M 18,5 L 38,92 L 72,5 L 54,5 L 38,62 L 32,5 Z" fill="#8bc34a" />
                      <Path
                        d="M 50,12 L 140,12 L 140,32 L 75,32 L 75,44 L 128,44 L 128,62 L 75,62 L 75,76 L 142,76 L 142,96 L 50,96 Z"
                        fill="#1b4d3e"
                      />
                      <Path d="M 50,12 L 140,12 L 140,28 L 75,28 L 50,12 Z" fill="#8bc34a" />
                      <Path d="M 75,44 L 128,44 L 128,58 L 75,58 Z" fill="#8bc34a" />
                      <Text x="2" y="114" fill="#8bc34a" style={{ fontSize: 12, fontWeight: 'bold' }}>
                        VISHAL
                      </Text>
                      <Text x="56" y="114" fill="#1b4d3e" style={{ fontSize: 12, fontWeight: 'bold' }}>
                        ENTERPRISE
                      </Text>
                    </Svg>
                  )}
                </View>
              )}
              <View style={{ flex: 1 }}>
                {showBusinessName && (
                  <Text style={[styles.textMd, styles.textBold]}>{businessDisplayName}</Text>
                )}
                {showGSTIN && (
                  <Text style={[styles.textSm, styles.textBold]}>
                    {sellerCC?.taxIdLabel || 'GSTIN'}: {profile?.gstin || '24AXCPS0336E1ZV'}
                  </Text>
                )}
                {profile?.pan && (
                  <Text style={styles.textSm}>
                    <Text style={styles.textBold}>PAN:</Text> {profile.pan}
                  </Text>
                )}
                {showBusinessAddress && (
                  <>
                    <Text style={styles.textSm}>{sellerAddressLine}</Text>
                    <Text style={styles.textSm}>{sellerCityLine}</Text>
                    <Text style={styles.textSm}>{sellerStatePinLine}</Text>
                  </>
                )}
                {showBusinessPhone && (
                  <Text style={styles.textSm}>
                    <Text style={styles.textBold}>Mobile:</Text> {sellerPhone}
                  </Text>
                )}
                {showBusinessEmail && (
                  <Text style={styles.textSm}>
                    <Text style={styles.textBold}>Email:</Text> {sellerEmail}
                  </Text>
                )}
                <Text style={styles.textSm}>
                  <Text style={styles.textBold}>Website:</Text> {sellerWebsite}
                </Text>
              </View>
            </View>

            {/* Customer */}
            <View style={styles.customerBox}>
              <Text style={styles.textSm}>Customer Details:</Text>
              <Text style={[styles.textMd, styles.textBold]}>{customerName}</Text>
              {customerGSTIN ? (
                <Text style={[styles.textSm, styles.textBold]}>
                  {sellerCC?.taxIdLabel || 'GSTIN'}: {customerGSTIN}
                </Text>
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
              {customerPhone ? (
                <Text style={styles.textSm}>
                  <Text style={styles.textBold}>Mobile:</Text> {customerPhone}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.rightCol}>
            <View style={styles.metaGrid}>
              <View style={styles.metaCell}>
                <Text style={styles.textSm}>{docNumberLabel}</Text>
                <Text style={styles.metaValue}>
                  {details?.invoiceNumber || 'VE-330'}
                </Text>
              </View>
              <View style={[styles.metaCell, { borderRightWidth: 0 }]}>
                <Text style={styles.textSm}>{docDateLabel}</Text>
                <Text style={styles.metaValue}>
                  {formatDate(details?.invoiceDate) || '06 Sep 2026'}
                </Text>
              </View>
              <View style={styles.metaCell}>
                {showPlaceOfSupply && (
                  <>
                    <Text style={styles.textSm}>Place of Supply:</Text>
                    <Text style={styles.metaValue}>
                      {details?.placeOfSupply || client?.state || '24-GUJARAT'}
                    </Text>
                  </>
                )}
              </View>
              <View style={[styles.metaCell, { borderRightWidth: 0 }]}>
                {showDueDate && details?.dueDate ? (
                  <>
                    <Text style={styles.textSm}>Due Date:</Text>
                    <Text style={styles.metaValue}>{formatDate(details.dueDate)}</Text>
                  </>
                ) : null}
              </View>
            </View>

            <View style={styles.dispatchBox}>
              <Text style={[styles.textSm, styles.textBold]}>Dispatch From:</Text>
              <Text style={styles.textSm}>{dispatchName}</Text>
              <Text style={styles.textSm}>{dispatchAddress}</Text>
              <Text style={styles.textSm}>{dispatchCityStatePin}</Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.col2, { paddingLeft: 4.5 }]}>Item</Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>HSN/SAC</Text>
            <Text style={[styles.tableHeaderCell, styles.col4]}>Tax</Text>
            <Text style={[styles.tableHeaderCell, styles.col5]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.col6, { paddingRight: 4.5 }]}>Rate / Item</Text>
            <Text style={[styles.tableHeaderCell, styles.col7]}>Per</Text>
            <Text style={[styles.tableHeaderCell, styles.col8, { paddingRight: 4.5 }]}>Amount</Text>
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
              <View key={item.id || idx} style={styles.tableRow} wrap={false}>
                <Text style={[styles.tableCell, styles.col1]}>{idx + 1}</Text>
                <View style={[styles.tableCell, styles.col2, { paddingLeft: 4.5 }]}>
                  <Text style={styles.itemName}>{item.name || '-'}</Text>
                  {item.description ? (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  ) : null}
                </View>
                <Text style={[styles.tableCell, styles.col3]}>{item.hsn || '-'}</Text>
                <Text style={[styles.tableCell, styles.col4]}>{taxRate ? `${taxRate}%` : '-'}</Text>
                <Text style={[styles.tableCell, styles.col5]}>{qty} {unit}</Text>
                <Text style={[styles.tableCell, styles.col6, styles.textBold, { paddingRight: 4.5 }]}>{fmtNum(rate)}</Text>
                <Text style={[styles.tableCell, styles.col7, { fontStyle: 'italic', fontFamily: 'Times-Roman' }]}>{unit}</Text>
                <Text style={[styles.tableCell, styles.col8, { paddingRight: 4.5 }]}>{fmtNum(afterDiscount)}</Text>
              </View>
            );
          })}

          {/* Vertical Fill Height Spacer Row (Maintains Vertical Lines Down) */}
          <View style={[styles.tableRow, { height: spacerHeight * 0.75 }]} wrap={false}>
            <View style={[styles.tableCell, styles.col1, { height: '100%' }]}></View>
            <View style={[styles.tableCell, styles.col2, { height: '100%' }]}></View>
            <View style={[styles.tableCell, styles.col3, { height: '100%' }]}></View>
            <View style={[styles.tableCell, styles.col4, { height: '100%' }]}></View>
            <View style={[styles.tableCell, styles.col5, { height: '100%' }]}></View>
            <View style={[styles.tableCell, styles.col6, { height: '100%' }]}></View>
            <View style={[styles.tableCell, styles.col7, { height: '100%' }]}></View>
            <View style={[styles.tableCell, styles.col8, { borderRightWidth: 0, height: '100%' }]}></View>
          </View>

          {/* Subtotal / Tax Summary (No bottom border) */}
          <View style={styles.tableRow} wrap={false}>
            <Text style={[styles.summaryCell, styles.col1]}></Text>
            <Text style={[styles.summaryCell, styles.col2, styles.summaryLabel]}>
              Taxable Amount
            </Text>
            <Text style={[styles.summaryCell, styles.col3]}></Text>
            <Text style={[styles.summaryCell, styles.col4]}></Text>
            <Text style={[styles.summaryCell, styles.col5]}></Text>
            <Text style={[styles.summaryCell, styles.col6]}></Text>
            <Text style={[styles.summaryCell, styles.col7]}></Text>
            <Text style={[styles.summaryCell, styles.col8, styles.summaryAmount]}>
              {fmtNum(totals.subtotal || 0)}
            </Text>
          </View>

          {isIndia && isInterstate ? (
            <View style={styles.tableRow} wrap={false}>
              <Text style={[styles.summaryCell, styles.col1]}></Text>
              <Text style={[styles.summaryCell, styles.col2, styles.summaryLabel]}>
                IGST {firstItemTax}%
              </Text>
              <Text style={[styles.summaryCell, styles.col3]}></Text>
              <Text style={[styles.summaryCell, styles.col4]}></Text>
              <Text style={[styles.summaryCell, styles.col5]}></Text>
              <Text style={[styles.summaryCell, styles.col6]}></Text>
              <Text style={[styles.summaryCell, styles.col7]}></Text>
              <Text style={[styles.summaryCell, styles.col8, styles.summaryAmount]}>
                {fmtNum(totals.igst || 0)}
              </Text>
            </View>
          ) : isIndia ? (
            <>
              <View style={styles.tableRow} wrap={false}>
                <Text style={[styles.summaryCell, styles.col1]}></Text>
                <Text style={[styles.summaryCell, styles.col2, styles.summaryLabel]}>
                  CGST {halfTax.toFixed(1)}%
                </Text>
                <Text style={[styles.summaryCell, styles.col3]}></Text>
                <Text style={[styles.summaryCell, styles.col4]}></Text>
                <Text style={[styles.summaryCell, styles.col5]}></Text>
                <Text style={[styles.summaryCell, styles.col6]}></Text>
                <Text style={[styles.summaryCell, styles.col7]}></Text>
                <Text style={[styles.summaryCell, styles.col8, styles.summaryAmount]}>
                  {fmtNum(totals.cgst || 0)}
                </Text>
              </View>
              <View style={styles.tableRow} wrap={false}>
                <Text style={[styles.summaryCell, styles.col1]}></Text>
                <Text style={[styles.summaryCell, styles.col2, styles.summaryLabel]}>
                  SGST {halfTax.toFixed(1)}%
                </Text>
                <Text style={[styles.summaryCell, styles.col3]}></Text>
                <Text style={[styles.summaryCell, styles.col4]}></Text>
                <Text style={[styles.summaryCell, styles.col5]}></Text>
                <Text style={[styles.summaryCell, styles.col6]}></Text>
                <Text style={[styles.summaryCell, styles.col7]}></Text>
                <Text style={[styles.summaryCell, styles.col8, styles.summaryAmount]}>
                  {fmtNum(totals.sgst || 0)}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.tableRow} wrap={false}>
              <Text style={[styles.summaryCell, styles.col1]}></Text>
              <Text style={[styles.summaryCell, styles.col2, styles.summaryLabel]}>Tax</Text>
              <Text style={[styles.summaryCell, styles.col3]}></Text>
              <Text style={[styles.summaryCell, styles.col4]}></Text>
              <Text style={[styles.summaryCell, styles.col5]}></Text>
              <Text style={[styles.summaryCell, styles.col6]}></Text>
              <Text style={[styles.summaryCell, styles.col7]}></Text>
              <Text style={[styles.summaryCell, styles.col8, styles.summaryAmount]}>
                {fmtNum((totals.cgst || 0) + (totals.sgst || 0) + (totals.igst || 0))}
              </Text>
            </View>
          )}

          {totals.cess > 0 && (
            <View style={styles.tableRow} wrap={false}>
              <Text style={[styles.summaryCell, styles.col1]}></Text>
              <Text style={[styles.summaryCell, styles.col2, styles.summaryLabel]}>GST Cess</Text>
              <Text style={[styles.summaryCell, styles.col3]}></Text>
              <Text style={[styles.summaryCell, styles.col4]}></Text>
              <Text style={[styles.summaryCell, styles.col5]}></Text>
              <Text style={[styles.summaryCell, styles.col6]}></Text>
              <Text style={[styles.summaryCell, styles.col7]}></Text>
              <Text style={[styles.summaryCell, styles.col8, styles.summaryAmount]}>
                {fmtNum(totals.cess)}
              </Text>
            </View>
          )}

          {/* Grand Total Row (Top and bottom sandwich border) */}
          <View style={[styles.tableRow, { borderTopWidth: 1.5, borderBottomWidth: 0.375, borderColor: '#000000' }]} wrap={false}>
            <Text style={[styles.summaryCell, styles.col1, { paddingVertical: 3 }]}></Text>
            <Text style={[styles.summaryCell, styles.col2, styles.summaryLabel, { paddingVertical: 3 }]}>
              Total
            </Text>
            <Text style={[styles.summaryCell, styles.col3, { paddingVertical: 3 }]}></Text>
            <Text style={[styles.summaryCell, styles.col4, { paddingVertical: 3 }]}></Text>
            <Text style={[styles.summaryCell, styles.col5, styles.textBold, { paddingVertical: 3 }]}>{totalQty}</Text>
            <Text style={[styles.summaryCell, { width: '16%', paddingVertical: 3 }]}></Text>
            <Text style={[styles.summaryCell, styles.col8, styles.summaryAmount, { fontSize: 9, paddingVertical: 3 }]}>
              ₹{fmtNum(totals.total || 0)}
            </Text>
          </View>
        </View>

        {/* Amount in Words */}
        {showAmountWords && (
          <View style={styles.wordsBox}>
            <Text>
              <Text>Total amount (in words): </Text>
              <Text style={styles.textBold}>{amountInWords || 'INR Zero Only'}. </Text>
              <Text style={{ fontStyle: 'italic' }}>E & O.E</Text>
            </Text>
          </View>
        )}

        {/* Bank Details & Authorization */}
        <View style={styles.footerGrid}>
          <View style={styles.bankBox}>
            <View>
              {showBankDetails && (
                <>
                  <Text style={[styles.textSm, styles.textBold, { marginBottom: 2 }]}>
                    Bank Details:
                  </Text>
                  <View style={{ flexDirection: 'row', marginTop: 1 }}>
                    <Text style={[styles.textSm, { width: '25%' }]}>Bank:</Text>
                    <Text style={[styles.textSm, styles.textBold, { width: '75%' }]}>{bankName}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 1 }}>
                    <Text style={[styles.textSm, { width: '25%' }]}>Account #:</Text>
                    <Text style={[styles.textSm, styles.textBold, { width: '75%' }]}>{accountNo}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 1 }}>
                    <Text style={[styles.textSm, { width: '25%' }]}>IFSC Code:</Text>
                    <Text style={[styles.textSm, styles.textBold, { width: '75%' }]}>{ifsc}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 1 }}>
                    <Text style={[styles.textSm, { width: '25%' }]}>Branch:</Text>
                    <Text style={[styles.textSm, styles.textBold, { width: '75%' }]}>{branch}</Text>
                  </View>
                </>
              )}
            </View>
            <Text style={[styles.textSm, styles.textBold, { marginTop: 6 }]}>
              {businessDisplayName}
            </Text>
          </View>

          <View style={styles.signBox}>
            <Text style={styles.signTop}>For {businessDisplayName}</Text>
            {showSignature && profile?.signature && (
              <Image
                src={profile.signature}
                style={{ maxHeight: 27, maxWidth: 90, objectFit: 'contain' }}
              />
            )}
            <Text style={styles.signBottom}>Authorized Signatory</Text>
          </View>
        </View>

        {/* Terms */}
        {showTerms && (
          <View style={styles.termsBox}>
            <Text style={[styles.textSm, styles.textBold]}>Terms and Conditions:</Text>
            <Text style={styles.textSm}>
              {customTerms ||
                '1. 50% advance payment and 50% on material dispatch.\n2. Price includes GST.\n3. Quotation valid for 30 days.'}
            </Text>
            {showNotes && customNotes ? (
              <View style={{ marginTop: 6, paddingTop: 3, borderTopWidth: 0.75, borderTopColor: '#f1f5f9' }}>
                <Text style={[styles.textSm, styles.textBold]}>Notes:</Text>
                <Text style={styles.textSm}>{customNotes}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </Page>
  );
};
