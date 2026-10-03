import { BackupPart, InvoiceNumberSettings } from './types';

export const JUMP_NAV_SECTIONS: [string, string][] = [
  ['section-company',  'Company'],
  ['section-profiles', 'Profiles'],
  ['section-terms',    'Terms'],
  ['section-print',    'Print & PDF'],
  ['section-modules',  'Features'],
  ['section-stock',    'Stock'],
  ['section-region',   'Region'],
  ['section-backups',  'Backups'],
  ['section-cloud',    'Google Drive'],
  ['section-data',     'Import/Export'],
  ['section-updates',  'Updates'],
];

export const ALL_BACKUP_PARTS: BackupPart[] = [
  { id: 'profile',        label: 'Active business profile',  hint: 'Name, address, GSTIN, bank, logo, signature' },
  { id: 'profiles',       label: 'All business profiles',    hint: 'Multi-business switcher entries' },
  { id: 'bills',          label: 'Invoices / bills',         hint: 'Tax invoices, proforma, credit notes, etc.' },
  { id: 'clients',        label: 'Clients',                  hint: 'Saved client directory' },
  { id: 'products',       label: 'Products / Inventory',     hint: 'Product catalog with HSN, rate, stock' },
  { id: 'expenses',       label: 'Expenses',                 hint: 'Expense tracker entries' },
  { id: 'purchases',      label: 'Purchase bills',           hint: 'Vendor bills used for ITC' },
  { id: 'recurring',      label: 'Recurring invoices',       hint: 'Auto-billing schedule entries' },
  { id: 'receipts',       label: 'Receipts',                 hint: 'Payment receipts' },
  { id: 'termsTemplates', label: 'Terms templates',          hint: 'Reusable T&C library' },
  { id: 'meta',           label: 'App settings',             hint: 'Region, modules, invoice number format, display options' },
  { id: 'localStorage',   label: 'Local preferences',        hint: 'Custom units, theme, last region preference' },
];

export const DEFAULT_INV_SETTINGS: InvoiceNumberSettings = {
  format: 'branded',
  brandPrefix: '',
  separator: '/',
  showFinYear: true,
  startNumber: 1,
  padDigits: 4,
};

export const QUICK_START_TEMPLATES = [
  {
    name: 'Services (IT, Consulting, Freelance)',
    content: `1. Payment is due within 15 days of invoice date via NEFT/RTGS/UPI unless otherwise agreed.
2. Late payment interest of 18% per annum will apply on overdue amounts as per MSME Act, 2006.
3. All amounts are exclusive of GST (CGST/SGST/IGST) as applicable under the GST Act, 2017.
4. Services rendered are non-refundable once delivered and accepted by the client.
5. TDS (if applicable) must be deducted as per Income Tax Act. Please share TDS certificate (Form 16A) within 15 days.
6. All deliverables remain the intellectual property of the service provider until full payment is received.
7. Any disputes shall be subject to the exclusive jurisdiction of courts in the service provider's city.
8. This is a computer-generated invoice and does not require a physical signature.`,
  },
  {
    name: 'Goods & Products (Retail, Wholesale)',
    content: `1. Goods once sold will not be taken back or exchanged unless defective as per Consumer Protection Act, 2019.
2. Payment is due on delivery via Cash/UPI/NEFT unless credit terms are agreed in advance.
3. Warranty (if applicable) covers manufacturing defects only as per terms mentioned on the product.
4. All prices are inclusive of GST (CGST + SGST / IGST) as shown on this invoice.
5. Claims for damaged or missing items must be reported within 48 hours of delivery with photos.
6. E-way bill is generated for consignments exceeding Rs. 50,000 as per GST rules.
7. Risk of loss passes to the buyer upon dispatch from our godown/warehouse.
8. Subject to jurisdiction of courts at the seller's place of business.
9. This is a computer-generated invoice and does not require a physical signature.`,
  },
  {
    name: 'Manufacturing & Trading',
    content: `1. All prices are ex-factory/ex-godown unless otherwise specified.
2. Payment terms: 50% advance via NEFT/RTGS, balance before dispatch (or as per agreed credit terms).
3. Goods dispatched only after full payment or confirmed credit arrangement.
4. Quality complaints must be raised within 7 days of receipt with photographic evidence.
5. Returns accepted only for manufacturing defects, subject to inspection at our premises.
6. GST, freight, insurance, loading/unloading charges are as per agreement or additional to quoted price.
7. E-way bill will be generated as per Section 68 of CGST Act for applicable consignments.
8. Force majeure: Delays due to natural calamities, strikes, or government orders shall not be held against us.
9. Interest @ 18% p.a. on overdue payments as per MSME Development Act, 2006.
10. Subject to exclusive jurisdiction of courts at the seller's registered office.
11. This is a computer-generated invoice and does not require a physical signature.`,
  },
  {
    name: 'Export / International',
    content: `1. All prices are in the agreed currency (USD/EUR/GBP) and exclusive of local taxes/duties in buyer's country.
2. Payment via wire transfer (SWIFT/TT) within 30 days of invoice date as per RBI guidelines.
3. Supply is zero-rated under GST — exported under Letter of Undertaking (LUT) / Bond.
4. Title and risk pass to buyer upon delivery to carrier (FOB/CIF as per Incoterms 2020).
5. Buyer is responsible for import duties, customs clearance, and local compliance in destination country.
6. Claims for shortage or damage must be filed within 14 days of receipt with supporting documents.
7. All payments to be received in INR equivalent or foreign currency as per FEMA regulations.
8. Disputes shall be resolved through arbitration in India under the Arbitration & Conciliation Act, 1996.
9. This is a computer-generated invoice and does not require a physical signature.`,
  },
  {
    name: 'Freelancer (Simple)',
    content: `1. Payment due within 7 days of invoice via UPI/NEFT/IMPS.
2. Late payments attract interest @ 2% per month.
3. 50% advance required before project commencement.
4. Scope changes after agreement will be quoted and billed separately.
5. All work remains property of the freelancer until full payment is received.
6. Cancellation after work begins: completed portion will be billed proportionally.
7. TDS (if applicable) to be deducted at source. Share Form 16A within 15 days of deduction.
8. Subject to jurisdiction of courts in the freelancer's city.
9. This is a computer-generated invoice.`,
  },
];
