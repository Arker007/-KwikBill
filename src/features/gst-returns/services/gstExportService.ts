import { formatDateGST, getStateCode, getUnitUQC, getFilingPeriod } from '@/shared/utils';
import { toast } from '@/shared/components/feedback/Toast';
import { round2, computeItemTaxSplit, getTaxableAmount, billIsInterstate, billIsIntraUT } from '../utils/gstCalculations';
import type { GrandTotals, ITCDetails, NetTax, ReconRow, TDSRow, TCSRow } from '../types';

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escape = (val: any) => {
    const s = String(val ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.map(escape).join(',')];
  rows.forEach(row => lines.push(row.map(escape).join(',')));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const GST_STANDARD_RATES = [0, 0.25, 3, 5, 12, 18, 28];
const INUM_REGEX = /^[A-Za-z0-9\-/]{1,16}$/;

export function validateGSTR1(bills: any[], profile: any): { blocked: string[]; warnings: string[] } {
  const blocked: string[] = [];
  const warnings: string[] = [];
  const aatoAbove5Cr = !!profile?.aatoAbove5Cr;
  const minHsnDigits = aatoAbove5Cr ? 6 : 4;

  const badInums = bills.filter(b => !INUM_REGEX.test(b.invoiceNumber || ''));
  if (badInums.length > 0) {
    blocked.push(
      `${badInums.length} invoice number(s) violate portal rules (≤16 chars, only letters, digits, "-" or "/"). First: ${badInums
        .slice(0, 3)
        .map(b => b.invoiceNumber)
        .join(', ')}`
    );
  }

  const badRates = new Set<number>();
  let badRateItemCount = 0;
  bills.forEach(bill => {
    (bill.data?.items || []).forEach((item: any) => {
      const rate = Number(item.taxPercent) || 0;
      if (!GST_STANDARD_RATES.includes(rate)) {
        badRates.add(rate);
        badRateItemCount += 1;
      }
    });
  });
  if (badRateItemCount > 0) {
    blocked.push(
      `${badRateItemCount} item(s) use non-standard tax rate(s) [${Array.from(badRates)
        .sort()
        .join(', ')}%]. Portal accepts only ${GST_STANDARD_RATES.join(', ')}%.`
    );
  }

  let missingHsnItemCount = 0;
  let shortHsnItemCount = 0;
  bills.forEach(bill => {
    (bill.data?.items || []).forEach((item: any) => {
      const hsn = String(item.hsn || '').trim();
      if (!hsn || hsn === 'N/A') missingHsnItemCount += 1;
      else if (hsn.replace(/\D/g, '').length < minHsnDigits) shortHsnItemCount += 1;
    });
  });
  if (missingHsnItemCount > 0) {
    warnings.push(`${missingHsnItemCount} item(s) have no HSN — dropped from HSN summary. GSTR-1 Table 12 requires an HSN per item.`);
  }
  if (shortHsnItemCount > 0) {
    warnings.push(
      `${shortHsnItemCount} item(s) have HSN shorter than ${minHsnDigits} digits (required for ${aatoAbove5Cr ? '>' : '≤'}₹5 Cr AATO). Portal may reject.`
    );
  }

  return { blocked, warnings };
}

export function exportB2BCSV(b2bRegular: any[]): void {
  if (b2bRegular.length === 0) {
    toast('No B2B data to export', 'warning');
    return;
  }
  downloadCSV(
    'GSTR1_B2B_Invoices.csv',
    [
      'GSTIN/UIN',
      'Receiver Name',
      'Invoice Number',
      'Invoice Date',
      'Invoice Value',
      'Place of Supply',
      'Reverse Charge',
      'Invoice Type',
      'Supply Type',
      'Taxable Value',
      'CGST Amount',
      'SGST Amount',
      'IGST Amount',
    ],
    b2bRegular.map(bill => {
      const { client, totals, details } = bill.data;
      const isInter = billIsInterstate(bill);
      const pos = getStateCode(details?.placeOfSupply || client?.state || '');
      return [
        client.gstin,
        client.name || bill.clientName || '',
        bill.invoiceNumber || '',
        formatDateGST(bill.invoiceDate),
        (totals?.total || 0).toFixed(2),
        pos,
        'N',
        'Regular',
        isInter ? 'Inter State' : 'Intra State',
        getTaxableAmount(totals).toFixed(2),
        isInter ? 0 : (totals?.cgst || 0).toFixed(2),
        isInter ? 0 : (totals?.sgst || 0).toFixed(2),
        isInter ? (totals?.igst || 0).toFixed(2) : 0,
      ];
    })
  );
  toast('B2B CSV downloaded — matches GSTR-1 Table 4A format', 'success');
}

export function exportB2CCSV(b2cSmall: any[], b2cLarge: any[], b2cRatesLength: number): void {
  if (b2cRatesLength === 0 && b2cLarge.length === 0) {
    toast('No B2C data to export', 'warning');
    return;
  }
  const b2csData: Record<string, any> = {};
  b2cSmall.forEach(bill => {
    const { profile: prof, client, items, details } = bill.data;
    const isInter = billIsInterstate(bill);
    const pos = getStateCode(details?.placeOfSupply || client?.state || prof?.state || '');
    const splyType = isInter ? 'INTER' : 'INTRA';
    (items || []).forEach((item: any) => {
      const rate = item.taxPercent || 0;
      const key = `${splyType}_${pos}_${rate}`;
      if (!b2csData[key]) b2csData[key] = { splyType, pos, rate, taxable: 0, cgst: 0, sgst: 0, igst: 0 };
      const split = computeItemTaxSplit(item, isInter, !!bill.data?.taxInclusive);
      b2csData[key].taxable += split.taxable;
      b2csData[key].cgst += split.cgst;
      b2csData[key].sgst += split.sgst;
      b2csData[key].igst += split.igst;
    });
  });
  downloadCSV(
    'GSTR1_B2C_Small.csv',
    ['Type', 'Place of Supply', 'Rate', 'Taxable Value', 'CGST Amount', 'SGST Amount', 'IGST Amount', 'Cess Amount'],
    Object.values(b2csData).map(d => [
      d.splyType === 'INTER' ? 'Inter State' : 'Intra State',
      d.pos,
      d.rate + '%',
      d.taxable.toFixed(2),
      d.cgst.toFixed(2),
      d.sgst.toFixed(2),
      d.igst.toFixed(2),
      '0.00',
    ])
  );
  if (b2cLarge.length > 0) {
    downloadCSV(
      'GSTR1_B2C_Large.csv',
      ['Invoice Number', 'Invoice Date', 'Invoice Value', 'Place of Supply', 'Taxable Value', 'IGST Amount', 'Cess Amount'],
      b2cLarge.map(bill => {
        const { client, totals, details } = bill.data;
        const pos = getStateCode(details?.placeOfSupply || client?.state || '');
        return [
          bill.invoiceNumber,
          formatDateGST(bill.invoiceDate),
          (totals?.total || 0).toFixed(2),
          pos,
          getTaxableAmount(totals).toFixed(2),
          (totals?.igst || 0).toFixed(2),
          '0.00',
        ];
      })
    );
  }
  toast('B2C CSV downloaded', 'success');
}

export function exportHSNCSV(filteredBills: any[], hsnRowsLength: number): void {
  if (hsnRowsLength === 0) {
    toast('No HSN data', 'warning');
    return;
  }
  const hsnDetailed: Record<string, any> = {};
  filteredBills.forEach(bill => {
    const { items } = bill.data;
    const isInter = billIsInterstate(bill);
    const isIntraUT = billIsIntraUT(bill);
    (items || []).forEach((item: any) => {
      const hsn = item.hsn || 'N/A';
      const rate = item.taxPercent || 0;
      const uqc = getUnitUQC(item.unit) || 'NOS';
      const key = `${hsn}|${rate}|${uqc}`;
      if (!hsnDetailed[key]) {
        hsnDetailed[key] = {
          hsn,
          desc: item.name || '',
          uqc,
          qty: 0,
          rate,
          taxable: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          cess: 0,
          totalValue: 0,
        };
      }
      const split = computeItemTaxSplit(item, isInter, !!bill.data?.taxInclusive, isIntraUT);
      hsnDetailed[key].qty += item.quantity || 0;
      hsnDetailed[key].taxable += split.taxable;
      hsnDetailed[key].cgst += split.cgst;
      hsnDetailed[key].sgst += split.sgst + split.utgst;
      hsnDetailed[key].igst += split.igst;
      hsnDetailed[key].cess += split.cess;
      hsnDetailed[key].totalValue += split.taxable + split.cgst + split.sgst + split.utgst + split.igst + split.cess;
    });
  });
  downloadCSV(
    'GSTR1_HSN_Summary.csv',
    [
      'HSN',
      'Description',
      'UQC',
      'Total Quantity',
      'Total Value',
      'Rate',
      'Taxable Value',
      'Integrated Tax Amount',
      'Central Tax Amount',
      'State/UT Tax Amount',
      'Cess Amount',
    ],
    Object.values(hsnDetailed).map(r => [
      r.hsn,
      r.desc,
      r.uqc,
      r.qty,
      r.totalValue.toFixed(2),
      r.rate,
      r.taxable.toFixed(2),
      r.igst.toFixed(2),
      r.cgst.toFixed(2),
      r.sgst.toFixed(2),
      r.cess.toFixed(2),
    ])
  );
  toast('HSN CSV downloaded — GSTR-1 Table 12 format', 'success');
}

export function exportCDNRCSV(creditNotes: any[]): void {
  const cdnrBills = creditNotes.filter(b => b.data?.client?.gstin);
  const cdnurBills = creditNotes.filter(b => !b.data?.client?.gstin);
  if (cdnrBills.length === 0 && cdnurBills.length === 0) {
    toast('No Credit Notes', 'warning');
    return;
  }
  if (cdnrBills.length > 0) {
    downloadCSV(
      'GSTR1_CDNR.csv',
      [
        'GSTIN/UIN',
        'Receiver Name',
        'Note Number',
        'Note Date',
        'Note Type',
        'Place of Supply',
        'Reverse Charge',
        'Note Value',
        'Taxable Value',
        'IGST Amount',
        'CGST Amount',
        'SGST Amount',
      ],
      cdnrBills.map(bill => {
        const { client, totals } = bill.data;
        const isInter = billIsInterstate(bill);
        const pos = getStateCode(bill.data.details?.placeOfSupply || client?.state || '');
        return [
          client.gstin,
          client.name || bill.clientName,
          bill.invoiceNumber,
          formatDateGST(bill.invoiceDate),
          'C',
          pos,
          'N',
          (totals?.total || 0).toFixed(2),
          getTaxableAmount(totals).toFixed(2),
          isInter ? (totals?.igst || 0).toFixed(2) : '0.00',
          isInter ? '0.00' : (totals?.cgst || 0).toFixed(2),
          isInter ? '0.00' : (totals?.sgst || 0).toFixed(2),
        ];
      })
    );
  }
  if (cdnurBills.length > 0) {
    downloadCSV(
      'GSTR1_CDNUR.csv',
      ['Note Number', 'Note Date', 'Note Type', 'Place of Supply', 'Note Value', 'Taxable Value', 'IGST Amount', 'Cess Amount'],
      cdnurBills.map(bill => {
        const { client, totals } = bill.data;
        const pos = getStateCode(bill.data.details?.placeOfSupply || client?.state || '');
        return [
          bill.invoiceNumber,
          formatDateGST(bill.invoiceDate),
          'C',
          pos,
          (totals?.total || 0).toFixed(2),
          getTaxableAmount(totals).toFixed(2),
          (totals?.igst || 0).toFixed(2),
          '0.00',
        ];
      })
    );
  }
  toast('Credit Notes exported', 'success');
}

export function exportDocSummaryCSV(docSummary: Record<string, any>): void {
  if (Object.keys(docSummary).length === 0) {
    toast('No documents', 'warning');
    return;
  }
  downloadCSV(
    'GSTR1_Doc_Summary.csv',
    ['Document Type', 'Sr. No. From', 'Sr. No. To', 'Total Number', 'Cancelled'],
    Object.entries(docSummary).map(([, d]) => [d.type, d.from, d.to, d.total, 0])
  );
  toast('Document Summary CSV downloaded', 'success');
}

export function exportGSTR3BCSV(grandTotals: GrandTotals, itcFromExpenses: ITCDetails, netTax: NetTax): void {
  downloadCSV('GSTR3B_Summary.csv', ['Description', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'Total'], [
    [
      '3.1(a) Outward taxable supplies',
      grandTotals.taxable.toFixed(2),
      grandTotals.igst.toFixed(2),
      grandTotals.cgst.toFixed(2),
      grandTotals.sgst.toFixed(2),
      (grandTotals.igst + grandTotals.cgst + grandTotals.sgst).toFixed(2),
    ],
    [
      '4(A) ITC Available',
      '',
      itcFromExpenses.igst.toFixed(2),
      itcFromExpenses.cgst.toFixed(2),
      itcFromExpenses.sgst.toFixed(2),
      (itcFromExpenses.igst + itcFromExpenses.cgst + itcFromExpenses.sgst).toFixed(2),
    ],
    [
      '6.1 Tax Payable',
      '',
      netTax.igst.toFixed(2),
      netTax.cgst.toFixed(2),
      netTax.sgst.toFixed(2),
      (netTax.igst + netTax.cgst + netTax.sgst).toFixed(2),
    ],
  ]);
  toast('GSTR-3B summary CSV downloaded', 'success');
}

export function exportGSTR1JSON(
  filteredBills: any[],
  profile: any,
  filterMode: string,
  monthFilter: string,
  yearFilter: string,
  b2bRegular: any[],
  b2cSmall: any[],
  b2cLarge: any[],
  creditNotes: any[],
  docSummary: Record<string, any>
): void {
  if (filteredBills.length === 0) {
    toast('No invoices to export', 'warning');
    return;
  }

  const { blocked, warnings } = validateGSTR1(filteredBills, profile);
  if (blocked.length > 0) {
    toast(`GSTR-1 export blocked — fix these first: ${blocked.join(' · ')}`, 'error', 12000);
    return;
  }

  const gstin = profile.gstin || '';
  const fp =
    filterMode === 'month'
      ? String(parseInt(monthFilter) + 1).padStart(2, '0') + yearFilter
      : getFilingPeriod(filteredBills[0]?.invoiceDate);

  const b2bMap: Record<string, any> = {};
  b2bRegular.forEach(bill => {
    const { client, totals, items, details } = bill.data;
    const ctin = client.gstin;
    if (!b2bMap[ctin]) b2bMap[ctin] = { ctin, inv: [] };
    const isInter = billIsInterstate(bill);
    const isIntraUT = billIsIntraUT(bill);
    const isRcm = !!bill.data?.invoiceOptions?.reverseCharge;
    const pos = getStateCode(details?.placeOfSupply || client?.state || '');
    const rateMap: Record<string, any> = {};
    (items || []).forEach((item: any) => {
      const rate = item.taxPercent || 0;
      if (!rateMap[rate]) rateMap[rate] = { txval: 0, iamt: 0, camt: 0, samt: 0, csamt: 0 };
      const split = computeItemTaxSplit(item, isInter, !!bill.data?.taxInclusive, isIntraUT);
      rateMap[rate].txval += split.taxable;
      rateMap[rate].iamt += split.igst;
      rateMap[rate].camt += split.cgst;
      rateMap[rate].samt += split.sgst + split.utgst;
      rateMap[rate].csamt += split.cess;
    });
    const rchrg = isRcm ? 'Y' : 'N';
    const isSEZ = !!client?.isSEZ;
    const isLUT =
      !!bill.data?.invoiceOptions?.isLUT || /\bLUT\b|Letter of Undertaking/i.test(bill.data?.customTerms || '');
    const invType = isRcm ? 'R' : isSEZ ? (isLUT ? 'SEWOP' : 'SEWP') : 'R';
    const rateTotal = Object.values(rateMap).reduce(
      (s: number, d: any) => s + d.txval + d.iamt + d.camt + d.samt + d.csamt,
      0
    );
    const val = isRcm ? round2(rateTotal) : round2((totals?.total || 0) - (totals?.roundOff || 0));
    b2bMap[ctin].inv.push({
      inum: bill.invoiceNumber,
      idt: formatDateGST(bill.invoiceDate),
      val,
      pos,
      rchrg,
      inv_typ: invType,
      itms: Object.entries(rateMap).map(([rt, d], i) => ({
        num: i + 1,
        itm_det: {
          rt: Number(rt),
          txval: round2(d.txval),
          iamt: round2(d.iamt),
          camt: round2(d.camt),
          samt: round2(d.samt),
          csamt: round2(d.csamt),
        },
      })),
    });
  });

  const b2csMap: Record<string, any> = {};
  b2cSmall.forEach(bill => {
    const { profile: prof, client, items, details } = bill.data;
    const isInter = billIsInterstate(bill);
    const isIntraUT = billIsIntraUT(bill);
    const pos = getStateCode(details?.placeOfSupply || client?.state || prof?.state || '');
    const splyTy = isInter ? 'INTER' : 'INTRA';
    (items || []).forEach((item: any) => {
      const rate = item.taxPercent || 0;
      const key = `${splyTy}_${pos}_${rate}`;
      if (!b2csMap[key]) b2csMap[key] = { sply_ty: splyTy, pos, rt: rate, txval: 0, iamt: 0, camt: 0, samt: 0, csamt: 0 };
      const split = computeItemTaxSplit(item, isInter, !!bill.data?.taxInclusive, isIntraUT);
      b2csMap[key].txval += split.taxable;
      b2csMap[key].iamt += split.igst;
      b2csMap[key].camt += split.cgst;
      b2csMap[key].samt += split.sgst + split.utgst;
      b2csMap[key].csamt += split.cess;
    });
  });
  const b2csArr = Object.values(b2csMap).map((d: any) => ({
    ...d,
    txval: round2(d.txval),
    iamt: round2(d.iamt),
    camt: round2(d.camt),
    samt: round2(d.samt),
    csamt: round2(d.csamt),
  }));

  const b2clMap: Record<string, any> = {};
  b2cLarge.forEach(bill => {
    const { client, totals, items, details } = bill.data;
    const pos = getStateCode(details?.placeOfSupply || client?.state || '');
    if (!b2clMap[pos]) b2clMap[pos] = { pos, inv: [] };
    const rateMap: Record<string, any> = {};
    (items || []).forEach((item: any) => {
      const rate = item.taxPercent || 0;
      if (!rateMap[rate]) rateMap[rate] = { txval: 0, iamt: 0, csamt: 0 };
      const split = computeItemTaxSplit(item, true, !!bill.data?.taxInclusive);
      rateMap[rate].txval += split.taxable;
      rateMap[rate].iamt += split.igst;
      const cessPct = Number(item.cessPercent) || 0;
      if (cessPct > 0) rateMap[rate].csamt += (split.taxable * cessPct) / 100;
    });
    b2clMap[pos].inv.push({
      inum: bill.invoiceNumber,
      idt: formatDateGST(bill.invoiceDate),
      val: round2(totals?.total || 0),
      itms: Object.entries(rateMap).map(([rt, d], i) => ({
        num: i + 1,
        itm_det: { rt: Number(rt), txval: round2(d.txval), iamt: round2(d.iamt), csamt: round2(d.csamt) },
      })),
    });
  });

  const cdnrMap: Record<string, any> = {};
  creditNotes
    .filter(b => b.data?.client?.gstin)
    .forEach(bill => {
      const { client, totals, items, details } = bill.data;
      const ctin = client.gstin;
      if (!cdnrMap[ctin]) cdnrMap[ctin] = { ctin, nt: [] };
      const isInter = billIsInterstate(bill);
      const pos = getStateCode(details?.placeOfSupply || client?.state || '');
      const rateMap: Record<string, any> = {};
      (items || []).forEach((item: any) => {
        const rate = item.taxPercent || 0;
        if (!rateMap[rate]) rateMap[rate] = { txval: 0, iamt: 0, camt: 0, samt: 0, csamt: 0 };
        const split = computeItemTaxSplit(item, isInter, !!bill.data?.taxInclusive);
        rateMap[rate].txval += split.taxable;
        rateMap[rate].iamt += split.igst;
        rateMap[rate].camt += split.cgst;
        rateMap[rate].samt += split.sgst;
        const cessPct = Number(item.cessPercent) || 0;
        if (cessPct > 0) rateMap[rate].csamt += (split.taxable * cessPct) / 100;
      });
      const rchrg = bill.data?.invoiceOptions?.reverseCharge ? 'Y' : 'N';
      const isSEZ = !!client?.isSEZ;
      const isLUT =
        /LUT|Letter of Undertaking|zero.?rated/i.test(bill.data?.customTerms || '') ||
        !!bill.data?.invoiceOptions?.isLUT;
      const invType = isSEZ ? (isLUT ? 'SEWOP' : 'SEWP') : 'R';
      cdnrMap[ctin].nt.push({
        ntty: 'C',
        nt_num: bill.invoiceNumber,
        nt_dt: formatDateGST(bill.invoiceDate),
        val: round2(totals?.total || 0),
        pos,
        rchrg,
        inv_typ: invType,
        itms: Object.entries(rateMap).map(([rt, d], i) => ({
          num: i + 1,
          itm_det: {
            rt: Number(rt),
            txval: round2(d.txval),
            iamt: round2(d.iamt),
            camt: round2(d.camt),
            samt: round2(d.samt),
            csamt: round2(d.csamt),
          },
        })),
      });
    });

  const hsnJsonMap: Record<string, any> = {};
  let unknownUnitCount = 0;
  filteredBills.forEach(bill => {
    const { items } = bill.data;
    const isInter = billIsInterstate(bill);
    (items || []).forEach((item: any) => {
      const hsnRaw = String(item.hsn || '').trim();
      if (!hsnRaw || hsnRaw === 'N/A') return;
      const hsn = hsnRaw;
      const rate = item.taxPercent || 0;
      const key = `${hsn}_${rate}`;
      const uqc = getUnitUQC(item.unit);
      if (uqc === 'OTH' && item.unit) unknownUnitCount += 1;
      if (!hsnJsonMap[key]) {
        hsnJsonMap[key] = {
          hsn_sc: hsn,
          desc: item.name || '',
          uqc,
          qty: 0,
          rt: rate,
          txval: 0,
          iamt: 0,
          camt: 0,
          samt: 0,
          csamt: 0,
        };
      }
      const split = computeItemTaxSplit(item, isInter, !!bill.data?.taxInclusive);
      hsnJsonMap[key].qty += item.quantity || 0;
      hsnJsonMap[key].txval += split.taxable;
      hsnJsonMap[key].iamt += split.igst;
      hsnJsonMap[key].camt += split.cgst;
      hsnJsonMap[key].samt += split.sgst;
      const cessPct = Number(item.cessPercent) || 0;
      if (cessPct > 0) hsnJsonMap[key].csamt += (split.taxable * cessPct) / 100;
    });
  });

  const docDet = Object.entries(docSummary).map(([, d], i) => ({
    doc_num: i + 1,
    docs: [{ num: 1, from: d.from, to: d.to, totnum: d.total, cancel: 0, net_issue: d.total }],
  }));

  const gt = Number(profile?.prevFYTurnover) || 0;
  const cur_gt = Number(profile?.currentFYTurnover) || 0;

  const gstr1 = {
    gstin,
    fp,
    gt,
    cur_gt,
    version: 'GST3.1.6',
    hash: 'hash',
    b2b: Object.values(b2bMap),
    b2cs: b2csArr,
    ...(Object.keys(b2clMap).length > 0 ? { b2cl: Object.values(b2clMap) } : {}),
    ...(Object.keys(cdnrMap).length > 0 ? { cdnr: Object.values(cdnrMap) } : {}),
    hsn: {
      data: Object.values(hsnJsonMap).map((r, i) => ({
        num: i + 1,
        ...r,
        txval: round2(r.txval),
        iamt: round2(r.iamt),
        camt: round2(r.camt),
        samt: round2(r.samt),
        csamt: round2(r.csamt),
      })),
    },
    doc_issue: { doc_det: docDet },
  };

  const blob = new Blob([JSON.stringify(gstr1, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GSTR1_${gstin || 'export'}_${fp}.json`;
  a.click();
  URL.revokeObjectURL(url);

  const postWarnings = [...warnings];
  if (unknownUnitCount > 0) {
    postWarnings.push(`${unknownUnitCount} item(s) used a custom unit and were exported as UQC 'OTH'.`);
  }
  if (postWarnings.length > 0) {
    toast(`GSTR-1 JSON exported. ⚠ ${postWarnings.join(' · ')}`, 'warning', 10000);
  } else {
    toast('GSTR-1 JSON exported — upload to GST portal offline tool', 'success');
  }
}

export function exportGSTR3BJSON(
  filteredBills: any[],
  filteredExpenses: any[],
  purchases: any[],
  profile: any,
  filterMode: string,
  monthFilter: string,
  yearFilter: string,
  grandTotals: GrandTotals,
  itcFromExpenses: ITCDetails
): void {
  if (filteredBills.length === 0 && filteredExpenses.length === 0) {
    toast('No data to export for this period', 'warning');
    return;
  }
  const gstin = profile?.gstin || '';
  const ret_period =
    filterMode === 'month'
      ? String(parseInt(monthFilter) + 1).padStart(2, '0') + yearFilter
      : getFilingPeriod(filteredBills[0]?.invoiceDate || filteredExpenses[0]?.date || new Date().toISOString());

  const sup_details = {
    osup_det: {
      txval: round2(grandTotals.taxable),
      iamt: round2(grandTotals.igst),
      camt: round2(grandTotals.cgst),
      samt: round2(grandTotals.sgst),
      csamt: round2(grandTotals.cess),
    },
    osup_zero: { txval: 0, iamt: 0, csamt: 0 },
    osup_nil_exmp: { txval: 0 },
    isup_rev: (() => {
      const rcmPurchases = (purchases || []).filter(p => !!p.reverseCharge);
      if (rcmPurchases.length === 0) return { txval: 0, iamt: 0, camt: 0, samt: 0, csamt: 0 };
      const t = rcmPurchases.reduce(
        (acc: any, p: any) => ({
          txval: acc.txval + (Number(p.taxableAmount) || 0),
          iamt: acc.iamt + (p.interstate ? Number(p.totalTax) || 0 : 0),
          camt: acc.camt + (p.interstate ? 0 : (Number(p.totalTax) || 0) / 2),
          samt: acc.samt + (p.interstate ? 0 : (Number(p.totalTax) || 0) / 2),
          csamt: acc.csamt + (Number(p.totalCess) || 0),
        }),
        { txval: 0, iamt: 0, camt: 0, samt: 0, csamt: 0 }
      );
      return {
        txval: round2(t.txval),
        iamt: round2(t.iamt),
        camt: round2(t.camt),
        samt: round2(t.samt),
        csamt: round2(t.csamt),
      };
    })(),
    osup_nongst: { txval: 0 },
  };

  const itc_elg = {
    itc_avl: [
      { ty: 'IMPG', iamt: 0, camt: 0, samt: 0, csamt: 0 },
      { ty: 'IMPS', iamt: 0, camt: 0, samt: 0, csamt: 0 },
      { ty: 'ISRC', iamt: 0, camt: 0, samt: 0, csamt: 0 },
      { ty: 'ISD', iamt: 0, camt: 0, samt: 0, csamt: 0 },
      {
        ty: 'OTH',
        iamt: round2(itcFromExpenses.igst),
        camt: round2(itcFromExpenses.cgst),
        samt: round2(itcFromExpenses.sgst),
        csamt: 0,
      },
    ],
    itc_inelg: [
      { ty: 'RUL', iamt: 0, camt: 0, samt: 0, csamt: 0 },
      { ty: 'OTH', iamt: 0, camt: 0, samt: 0, csamt: 0 },
    ],
  };

  const inward_sup = {
    isup_details: [
      { ty: 'GST', inter: 0, intra: 0 },
      { ty: 'NONGST', inter: 0, intra: 0 },
    ],
  };

  const gstr3b = {
    gstin,
    ret_period,
    version: 'GST3.0.4',
    hash: 'hash',
    sup_details,
    itc_elg,
    inward_sup,
  };
  const blob = new Blob([JSON.stringify(gstr3b, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GSTR3B_${gstin || 'export'}_${ret_period}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('GSTR-3B JSON exported — upload to GST portal offline tool', 'success');
}

export function exportReconCSV(reconRows: ReconRow[]): void {
  if (reconRows.length === 0) {
    toast('Nothing to export', 'warning');
    return;
  }
  downloadCSV(
    'GSTR2B_Reconciliation.csv',
    [
      'Status',
      'Supplier GSTIN',
      'Supplier Name',
      'Invoice No.',
      'Invoice Date',
      '2B Value',
      'Books Value',
      'Diff',
      '2B Taxable',
      'Books Taxable',
      '2B IGST',
      '2B CGST',
      '2B SGST',
      'ITC Available',
    ],
    reconRows.map(r => [
      r.status,
      r.ctin,
      r.supplier,
      r.invoiceNumber,
      r.date,
      r.twoBVal.toFixed(2),
      r.bookVal.toFixed(2),
      (r.twoBVal - r.bookVal).toFixed(2),
      r.twoBTaxable.toFixed(2),
      r.bookTaxable.toFixed(2),
      r.twoBIgst.toFixed(2),
      r.twoBCgst.toFixed(2),
      r.twoBSgst.toFixed(2),
      r.itcAvailable ? 'Y' : 'N',
    ])
  );
  toast('Reconciliation CSV downloaded', 'success');
}

export function exportTDSCSV(tdsRows: TDSRow[]): void {
  if (tdsRows.length === 0) {
    toast('No TDS entries in this period', 'warning');
    return;
  }
  downloadCSV(
    'TDS_Receivable_Report.csv',
    ['Quarter', 'Section', 'Rate %', 'Invoice No.', 'Date', 'Client', 'Client GSTIN', 'Client PAN', 'Taxable Value', 'TDS Amount'],
    tdsRows.map(r => [
      r.quarter,
      r.section,
      r.rate,
      r.invoiceNumber,
      r.date,
      r.clientName,
      r.clientGstin,
      r.clientPan,
      r.taxable.toFixed(2),
      r.tds.toFixed(2),
    ])
  );
  toast('TDS report exported', 'success');
}

export function exportTCSCSV(tcsRows: TCSRow[]): void {
  if (tcsRows.length === 0) {
    toast('No TCS entries in this period', 'warning');
    return;
  }
  downloadCSV(
    'TCS_Collected_Report.csv',
    ['Quarter', 'Section', 'Rate %', 'Invoice No.', 'Date', 'Client', 'Client GSTIN', 'Client PAN', 'Taxable Value', 'TCS Amount'],
    tcsRows.map(r => [
      r.quarter,
      r.section,
      r.rate,
      r.invoiceNumber,
      r.date,
      r.clientName,
      r.clientGstin,
      r.clientPan,
      r.taxable.toFixed(2),
      r.tcs.toFixed(2),
    ])
  );
  toast('TCS report exported', 'success');
}
