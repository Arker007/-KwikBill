// Invoice type configuration and constants

export const INVOICE_TYPES = {
  'tax-invoice': {
    label: 'Tax Invoice',
    prefix: 'INV',
    title: 'TAX INVOICE',
    showGST: true,
    description: 'Standard GST tax invoice',
  },
  'proforma': {
    label: 'Proforma / Estimate',
    prefix: 'EST',
    title: 'PROFORMA INVOICE',
    showGST: true,
    description: 'Quotation or estimate — not a legal tax document',
  },
  'bill-of-supply': {
    label: 'Bill of Supply (No GST)',
    prefix: 'BOS',
    title: 'BILL OF SUPPLY',
    showGST: false,
    description: 'For exempt goods/services or non-composition dealers selling exempt supplies',
  },
  'composition': {
    label: 'Composition (Bill of Supply)',
    prefix: 'COMP',
    title: 'BILL OF SUPPLY',
    showGST: false,
    description: 'For composition-scheme dealers under Section 10. Auto-adds Rule 46A declaration.',
  },
  'credit-note': {
    label: 'Credit Note',
    prefix: 'CN',
    title: 'CREDIT NOTE',
    showGST: true,
    description: 'Issued for returns, price adjustments, or corrections',
  },
  'debit-note': {
    label: 'Debit Note',
    prefix: 'DN',
    title: 'DEBIT NOTE',
    showGST: true,
    description: 'Issued for additional charges or price increases',
  },
  'receipt-voucher': {
    label: 'Receipt Voucher',
    prefix: 'RV',
    title: 'RECEIPT VOUCHER',
    showGST: true,
    description: 'Issued on receipt of advance payment under GST Rule 50',
  },
  'delivery-challan': {
    label: 'Delivery Challan',
    prefix: 'DC',
    title: 'DELIVERY CHALLAN',
    showGST: false,
    description: 'For job work, goods sent on approval, or supply without invoice (Rule 55)',
  },
};

export const TDS_SECTIONS = [
  { code: '194Q', label: '194Q — Purchase of goods (buyer turnover > ₹10cr)', rate: 0.1 },
  { code: '194C', label: '194C — Contractor / sub-contractor', rate: 1 },
  { code: '194C-co', label: '194C — Contractor (company)', rate: 2 },
  { code: '194J', label: '194J — Professional / technical services', rate: 10 },
  { code: '194J-tech', label: '194J — Technical services (lower rate)', rate: 2 },
  { code: '194I', label: '194I — Rent (land / building)', rate: 10 },
  { code: '194I-pm', label: '194I — Rent (plant / machinery)', rate: 2 },
  { code: '194H', label: '194H — Commission / brokerage', rate: 5 },
  { code: '194O', label: '194O — E-commerce participant', rate: 1 },
  { code: '195',  label: '195 — Payments to non-residents (varies)', rate: 0 },
  { code: 'custom', label: 'Custom section / rate', rate: 0 },
];

export const TCS_SECTIONS = [
  { code: '206C(1H)', label: '206C(1H) — Sale of goods (seller turnover > ₹10cr)', rate: 0.1 },
  { code: '52',       label: 'CGST 52 — E-commerce operator', rate: 1 },
  { code: '206C(1)',  label: '206C(1) — Tendu leaves / scrap / minerals (varies)', rate: 1 },
  { code: 'custom',   label: 'Custom rate', rate: 0 },
];

