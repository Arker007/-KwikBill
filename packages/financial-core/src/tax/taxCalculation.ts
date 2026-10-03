import {
  TDS_TCS_THRESHOLD,
} from '../constants/index.ts';

import {
  getStateCode,
  isUnionTerritoryWithoutLegislature,
} from '../validators/index.ts';

import {
  toCsvCell,
  toCsvLine,
} from '../formatters/index.ts';

const finiteNonNeg = (n: any): number => {
  const x = Number(n);
  return isFinite(x) && x > 0 ? x : 0;
};

/**
 * Resolve a line's effective discount amount from the (discountType, discountBase) matrix.
 */
export const resolveLineDiscount = (item: any = {}): number => {
  const qty = finiteNonNeg(item.quantity);
  const rate = finiteNonNeg(item.rate);
  const net = qty * rate;
  const raw = finiteNonNeg(item.discount);
  if (raw <= 0 || net <= 0) return 0;

  if (item.discountType === 'percent') {
    return Math.min(net, (net * Math.min(raw, 100)) / 100);
  }

  // Fixed-mode routing based on discountBase.
  const base = item.discountBase || 'net';
  if (base === 'unit') {
    return Math.min(net, qty * raw);
  }
  if (base === 'with-tax') {
    const taxRate = finiteNonNeg(item.taxPercent);
    const divisor = 1 + taxRate / 100;
    return Math.min(net, divisor > 0 ? raw / divisor : raw);
  }
  // default: net-amount base
  return Math.min(net, raw);
};

/**
 * Calculate per-item tax breakdown.
 */
export const calculateLineItemTax = (item: any = {}, taxInclusive: boolean = false) => {
  const qty = finiteNonNeg(item.quantity);
  const rate = finiteNonNeg(item.rate);
  const discount = resolveLineDiscount(item);
  const taxRate = finiteNonNeg(item.taxPercent);
  const amount = qty * rate;
  const grossAfterDiscount = Math.max(0, amount - discount);
  if (taxInclusive && taxRate > 0) {
    const afterDiscount = grossAfterDiscount / (1 + taxRate / 100);
    const taxAmount = grossAfterDiscount - afterDiscount;
    return { amount, discount, afterDiscount, taxAmount, total: grossAfterDiscount };
  }
  const afterDiscount = grossAfterDiscount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  return { amount, discount, afterDiscount, taxAmount, total: afterDiscount + taxAmount };
};

const sum = (arr: number[]): number => arr.reduce((s, n) => s + (Number(n) || 0), 0);
const r2 = (n: number): number => Math.round((Number(n) || 0) * 100) / 100;

/**
 * Pure invoice totals computation for Indian GST / statutory requirements.
 */
export function computeInvoiceTotals(opts: any) {
  const rawOpts = opts || {};
  const items = rawOpts.items || [];
  const profile = rawOpts.profile || {};
  const client = rawOpts.client || {};
  const details = rawOpts.details || {};
  const showGST = rawOpts.showGST !== false;
  const taxInclusive = !!rawOpts.taxInclusive;
  const invoiceOptions = rawOpts.invoiceOptions || {};

  const warnings: string[] = [];
  const isIndia = (profile.country || 'India') === 'India';

  const lines = items.map((item: any) => {
    const qty = finiteNonNeg(item.quantity);
    const rate = finiteNonNeg(item.rate);
    const disc = resolveLineDiscount(item);
    const taxPct = finiteNonNeg(item.taxPercent);
    const cessPct = finiteNonNeg(item.cessPercent);
    const gross = qty * rate;
    const afterDisc = Math.max(0, gross - disc);
    const applyTax = !!showGST;
    const taxable = (applyTax && taxInclusive && taxPct > 0) ? afterDisc / (1 + taxPct / 100) : afterDisc;
    const tax = applyTax ? r2(taxable * taxPct / 100) : 0;
    const cess = applyTax ? r2(taxable * cessPct / 100) : 0;
    return { qty, rate, disc, taxPct, cessPct, gross, afterDisc, taxable: r2(taxable), tax, cess };
  });

  const subtotal = r2(sum(lines.map(l => l.gross)));
  const totalDiscount = r2(sum(lines.map(l => l.disc)));
  const taxableAmount = r2(sum(lines.map(l => l.taxable)));
  const taxTotal = r2(sum(lines.map(l => l.tax)));
  const cessTotal = r2(sum(lines.map(l => l.cess)));

  const businessState = (profile.state || '').trim();
  const clientState = (client.state || '').trim();
  const placeOfSupplyRaw = (details.placeOfSupply || clientState || '').trim();
  const businessCode = getStateCode(businessState || profile.gstin);
  const posCode = getStateCode(placeOfSupplyRaw || client.gstin);
  const isSEZ = !!client.isSEZ;

  let needsProfileFix = false;
  if (isIndia && showGST && !businessState) {
    warnings.push('Your business state is not set. Interstate/intra-state detection cannot be trusted. Set it in Settings → Company Details before issuing GST invoices.');
    needsProfileFix = true;
  }

  const clientCountry = (client.country || '').trim();
  const isExportClient = isIndia && !!clientCountry && clientCountry !== 'India'
    && !getStateCode((details.placeOfSupply || '').trim());

  if (isIndia && showGST && !placeOfSupplyRaw && !isExportClient) {
    warnings.push('Place of supply is not set. Falling back to client state.');
  }

  const isInterstate = isIndia && (isSEZ || isExportClient || (
    !!businessCode && !!posCode && businessCode !== posCode
  ));

  const isIntraUT = isIndia && !isInterstate && !!businessCode &&
    businessCode === posCode &&
    isUnionTerritoryWithoutLegislature(businessCode);

  const half = r2(taxTotal / 2);
  const cgst = isIndia && !isInterstate ? half : 0;
  const sgst = isIndia && !isInterstate && !isIntraUT ? half : 0;
  const utgst = isIndia && isIntraUT ? half : 0;
  const igst = isIndia ? (isInterstate ? taxTotal : 0) : taxTotal;

  const isReverseCharge = !!invoiceOptions.reverseCharge && !!showGST;

  const baseTotal = isReverseCharge
    ? taxableAmount
    : (taxInclusive && showGST ? subtotal - totalDiscount : taxableAmount + taxTotal);

  const tcsCumBefore = Number(invoiceOptions.tcsCumulativeThisYear) || 0;
  const tdsCumBefore = Number(invoiceOptions.tdsCumulativeThisYear) || 0;

  const receiptIncludingGst = r2(taxableAmount + taxTotal + cessTotal);

  const marginalTcsBase = tcsCumBefore >= TDS_TCS_THRESHOLD
    ? receiptIncludingGst
    : Math.max(0, (tcsCumBefore + receiptIncludingGst) - TDS_TCS_THRESHOLD);
  const marginalTdsBase = tdsCumBefore >= TDS_TCS_THRESHOLD
    ? receiptIncludingGst
    : Math.max(0, (tdsCumBefore + receiptIncludingGst) - TDS_TCS_THRESHOLD);

  const tcsRate = Number(invoiceOptions.tcsRate) || 0;
  const tdsRate = Number(invoiceOptions.tdsRate) || 0;
  const tcsAmount = invoiceOptions.showTCS && tcsRate > 0
    ? r2(marginalTcsBase * tcsRate / 100) : 0;
  const tdsAmount = invoiceOptions.showTDS && tdsRate > 0
    ? r2(marginalTdsBase * tdsRate / 100) : 0;

  const invDiscValue = finiteNonNeg(invoiceOptions.invoiceDiscountValue);
  const invDiscType = invoiceOptions.invoiceDiscountType === 'percent' ? 'percent' : 'fixed';
  const cessOnInvoice = isReverseCharge ? 0 : cessTotal;
  const preInvDiscTotal = baseTotal + tcsAmount + cessOnInvoice;
  const invoiceDiscountAmount = invDiscType === 'percent'
    ? Math.min(preInvDiscTotal, r2(preInvDiscTotal * Math.min(invDiscValue, 100) / 100))
    : Math.min(preInvDiscTotal, r2(invDiscValue));

  const totalBeforeRound = preInvDiscTotal - invoiceDiscountAmount;
  const roundOff = invoiceOptions.showRoundOff
    ? r2(Math.round(totalBeforeRound) - totalBeforeRound)
    : 0;
  const total = r2(totalBeforeRound + roundOff);

  const zeroTaxOnTotals = isReverseCharge;

  const totalTaxAmount = r2(
    (zeroTaxOnTotals ? 0 : cgst) +
    (zeroTaxOnTotals ? 0 : sgst) +
    (zeroTaxOnTotals ? 0 : utgst) +
    (zeroTaxOnTotals ? 0 : igst) +
    (zeroTaxOnTotals ? 0 : cessTotal)
  );

  const result: any = {
    subtotal, totalDiscount, taxableAmount,
    cgst: zeroTaxOnTotals ? 0 : cgst,
    sgst: zeroTaxOnTotals ? 0 : sgst,
    utgst: zeroTaxOnTotals ? 0 : utgst,
    igst: zeroTaxOnTotals ? 0 : igst,
    cess: cessTotal,
    tcsAmount, tdsAmount, roundOff,
    invoiceDiscountAmount, invoiceDiscountType: invDiscType, invoiceDiscountValue: invDiscValue,
    total,
    netReceivable: r2(total - tdsAmount),
    totalTaxAmount,
    totalTaxCollected: totalTaxAmount,
    totalTax: totalTaxAmount,
    taxTotal: totalTaxAmount,
    subTotal: taxableAmount,
    isInterstate, isIntraUT, isUnionTerritory: isIntraUT,
    taxInclusive: !!(taxInclusive && showGST),
    warnings, needsProfileFix,
    lines,
  };

  if (isReverseCharge) {
    result.rcmTaxCgst = cgst;
    result.rcmTaxSgst = sgst;
    result.rcmTaxUtgst = utgst;
    result.rcmTaxIgst = igst;
    result.rcmTaxTotal = r2(cgst + sgst + utgst + igst);
  }

  return result;
}

export const calculateRoundOff = (total: number): number => {
  if (typeof total !== 'number' || isNaN(total)) return 0;
  const rounded = Math.round(total);
  return Math.round((rounded - total) * 100) / 100;
};

export const generateEWayBillJSON = (
  seller: any = {},
  buyer: any = {},
  invoice: any = {},
  items: any[] = [],
  totals: any = {},
  invoiceType: string = 'tax-invoice',
  opts: any = {}
) => {
  const taxInclusive = !!opts.taxInclusive;
  const isInter = seller.state !== buyer.state;

  const itemList = items.map((item: any, idx: number) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const net = qty * rate;
    const disc = Number(item.discount) || 0;
    let taxable = net - disc;
    if (taxInclusive) {
      const tr = Number(item.taxPercent) || 0;
      taxable = taxable / (1 + tr / 100);
    }
    const rateHalf = (Number(item.taxPercent) || 0) / 2;

    return {
      itemNo: idx + 1,
      productName: item.name || 'Goods',
      productDesc: item.name || 'Goods',
      hsnCode: Number(item.hsn) || 0,
      quantity: qty,
      qtyUnit: item.unit || 'Nos',
      taxableAmount: Math.round(taxable * 100) / 100,
      cgstRate: isInter ? 0 : rateHalf,
      sgstRate: isInter ? 0 : rateHalf,
      igstRate: isInter ? Number(item.taxPercent) || 0 : 0,
      cessRate: Number(item.cessPercent) || 0
    };
  });

  const totalValue = itemList.reduce((sum, item) => sum + item.taxableAmount, 0);

  return {
    billLists: [
      {
        userGstin: seller.gstin || '',
        supplyType: 'Outward',
        subSupplyType: 'Supply',
        docType: invoiceType === 'delivery-challan' ? 'CHL' : 'INV',
        docNo: invoice.invoiceNumber || '',
        docDate: invoice.invoiceDate || '',
        fromGstin: seller.gstin || '',
        fromTrdName: seller.businessName || '',
        fromAddr1: seller.address || '',
        fromAddr2: '',
        fromPlace: seller.city || '',
        fromPincode: Number(seller.pin) || 0,
        fromStateCode: Number(seller.stateCode) || 27,
        toGstin: buyer.gstin || '',
        toTrdName: buyer.name || '',
        toAddr1: buyer.address || '',
        toAddr2: '',
        toPlace: buyer.city || '',
        toPincode: Number(buyer.pin) || 0,
        toStateCode: Number(buyer.stateCode) || 27,
        totalValue: Math.round(totalValue * 100) / 100,
        cgstValue: isInter ? 0 : Number(totals.cgst) || 0,
        sgstValue: isInter ? 0 : Number(totals.sgst) || 0,
        igstValue: isInter ? Number(totals.igst) || 0 : 0,
        cessValue: Number(totals.cess) || 0,
        totInvValue: Number(totals.total) || 0,
        transporterId: '',
        transporterName: '',
        transDistance: '0',
        itemList
      }
    ]
  };
};
