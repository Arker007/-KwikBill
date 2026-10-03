/**
 * Business & Profile Multitenancy Utilities
 */

import { COUNTRIES, INDIAN_STATES, US_STATES, CANADA_PROVINCES, AUSTRALIA_STATES } from '../constants/index.ts';

const normaliseGstin = (v?: string): string => String(v || '').trim().toUpperCase();
const normaliseName = (v?: string): string => String(v || '').trim().toLowerCase();

export const getRecordSeller = (record: any) => ({
  gstin: normaliseGstin(record?.data?.profile?.gstin ?? record?.ownerGstin),
  name: normaliseName(record?.data?.profile?.businessName ?? record?.ownerName),
});

export const isUnassignedToBusiness = (record: any): boolean => {
  const seller = getRecordSeller(record);
  return !seller.gstin && !seller.name;
};

export const belongsToProfile = (record: any, profile: any): boolean => {
  if (!profile) return true;
  const seller = getRecordSeller(record);
  const activeGstin = normaliseGstin(profile.gstin);
  const activeName = normaliseName(profile.businessName);

  if (seller.gstin && activeGstin) return seller.gstin === activeGstin;
  if (seller.name && activeName) return seller.name === activeName;
  return true;
};

export const BUILTIN_UNITS = [
  { label: 'Pcs', uqc: 'PCS', kind: 'goods' },
  { label: 'Nos', uqc: 'NOS', kind: 'both' },
  { label: 'Kg', uqc: 'KGS', kind: 'goods' },
  { label: 'g', uqc: 'GMS', kind: 'goods' },
  { label: 'Tonne', uqc: 'TON', kind: 'goods' },
  { label: 'Ltr', uqc: 'LTR', kind: 'goods' },
  { label: 'ml', uqc: 'MLT', kind: 'goods' },
  { label: 'Mtr', uqc: 'MTR', kind: 'goods' },
  { label: 'cm', uqc: 'CMS', kind: 'goods' },
  { label: 'Sq Ft', uqc: 'SQF', kind: 'goods' },
  { label: 'Sq Mtr', uqc: 'SQM', kind: 'goods' },
  { label: 'Box', uqc: 'BOX', kind: 'goods' },
  { label: 'Pack', uqc: 'PAC', kind: 'goods' },
  { label: 'Set', uqc: 'SET', kind: 'goods' },
  { label: 'Pair', uqc: 'PRS', kind: 'goods' },
  { label: 'Dozen', uqc: 'DOZ', kind: 'goods' },
  { label: 'Bag', uqc: 'BAG', kind: 'goods' },
  { label: 'Roll', uqc: 'ROL', kind: 'goods' },
  { label: 'Hrs', uqc: 'OTH', kind: 'services' },
  { label: 'Days', uqc: 'OTH', kind: 'services' },
  { label: 'Months', uqc: 'OTH', kind: 'services' },
  { label: 'Units', uqc: 'UNT', kind: 'both' },
];

const CUSTOM_UNITS_KEY = 'gst_customUnits';

export const getCustomUnits = () => {
  try {
    const raw = localStorage.getItem(CUSTOM_UNITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((u: any) => u && typeof u.label === 'string') : [];
  } catch { return []; }
};

export const addCustomUnit = (label: string) => {
  const trimmed = (label || '').trim();
  if (!trimmed || trimmed.length > 20) return false;
  const existing = getCustomUnits();
  if (existing.some((u: any) => u.label.toLowerCase() === trimmed.toLowerCase())) return false;
  if (BUILTIN_UNITS.some(u => u.label.toLowerCase() === trimmed.toLowerCase())) return false;
  const next = [...existing, { label: trimmed, uqc: 'OTH', custom: true }];
  try { localStorage.setItem(CUSTOM_UNITS_KEY, JSON.stringify(next)); } catch { return false; }
  return true;
};

export const removeCustomUnit = (label: string) => {
  const next = getCustomUnits().filter((u: any) => u.label !== label);
  try { localStorage.setItem(CUSTOM_UNITS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
};

export function getAllUnits(): Array<{ label: string; uqc: string; kind?: string; custom?: boolean }> {
  return [...BUILTIN_UNITS, ...getCustomUnits()];
}

export function getUnitUQC(unitLabel?: string): string {
  const found = getAllUnits().find(u => u.label.toLowerCase() === String(unitLabel || '').toLowerCase());
  return found?.uqc || 'OTH';
}

export const filterUnitsByMode = (units: any[], mode?: string) => {
  if (mode === 'mixed' || !mode) return units;
  return units.filter((u: any) => u.kind === mode || u.kind === 'both' || u.custom);
};

export function getStatesForCountry(countryName?: string) {
  const name = String(countryName || 'India').toLowerCase();
  if (name === 'india') return INDIAN_STATES;
  if (name === 'united states' || name === 'usa') return US_STATES;
  if (name === 'canada') return CANADA_PROVINCES;
  if (name === 'australia') return AUSTRALIA_STATES;
  return [];
}

export function detectCountryFromBrowser(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.startsWith('Asia/Kolkata') || tz.startsWith('Asia/Calcutta')) return 'India';
    if (tz.startsWith('America/')) return 'United States';
    if (tz.startsWith('Europe/London')) return 'United Kingdom';
    if (tz.startsWith('Australia/')) return 'Australia';
    if (tz.startsWith('Asia/Dubai')) return 'United Arab Emirates';
    if (tz.startsWith('Asia/Singapore')) return 'Singapore';
  } catch {
    // fallback
  }
  return 'India';
}

export function getCountriesForRegion(regionMode: 'india' | 'international' | 'all' = 'all') {
  if (regionMode === 'india') return COUNTRIES.filter(c => c.code === 'IN');
  if (regionMode === 'international') return COUNTRIES.filter(c => c.code !== 'IN');
  return COUNTRIES;
}

export function maskAccountNumber(accNo?: string): string {
  const str = String(accNo || '').trim();
  if (str.length <= 4) return str;
  return '•'.repeat(Math.max(0, str.length - 4)) + str.slice(-4);
}

export function getDefaultUnitForMode(mode?: string): string {
  if (mode === 'services') return 'Hrs';
  if (mode === 'mixed') return 'Nos';
  return 'Nos';
}

export function getDefaultAccount(profile: any) {
  const accounts = getPaymentAccounts(profile);
  return accounts.find((a: any) => a.isDefault) || accounts[0] || null;
}

export function getAccountById(profile: any, id?: string) {
  if (!id) return getDefaultAccount(profile);
  const accounts = getPaymentAccounts(profile);
  return accounts.find((a: any) => a.id === id) || getDefaultAccount(profile);
}

export function getActiveAccounts(profile: any) {
  return getPaymentAccounts(profile).filter((a: any) => a.isActive !== false);
}

export function createEmptyAccount(label: string = 'Primary Account') {
  return {
    id: 'acc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    label,
    accountName: '',
    accountNumber: '',
    accountType: 'current',
    ifsc: '',
    bankName: '',
    branch: '',
    swift: '',
    upiId: '',
    notes: '',
    isDefault: false,
    isActive: true,
  };
}

export const PAPER_SIZES: Record<string, any> = {
  a4: {
    label: 'A4 Portrait (default)',
    hint: 'Standard business invoice — 210 × 297 mm',
    widthMm: 210, heightMm: 297,
    jsPdfFormat: 'a4', jsPdfOrientation: 'portrait',
    cssClass: 'paper-a4',
    kind: 'sheet',
  },
  a4Landscape: {
    label: 'A4 Landscape',
    hint: 'Sideways A4 — 297 × 210 mm. More columns fit; useful for detailed itemized invoices.',
    widthMm: 297, heightMm: 210,
    jsPdfFormat: 'a4', jsPdfOrientation: 'landscape',
    cssClass: 'paper-a4-landscape',
    kind: 'sheet',
  },
  a5: {
    label: 'A5 Portrait (compact)',
    hint: 'Half sheet — 148 × 210 mm. Fits smaller printers.',
    widthMm: 148, heightMm: 210,
    jsPdfFormat: 'a5', jsPdfOrientation: 'portrait',
    cssClass: 'paper-a5',
    kind: 'sheet',
  },
  a5Landscape: {
    label: 'A5 Landscape (2 per A4 sheet)',
    hint: 'Sideways A5 — 210 × 148 mm. Print two invoices per A4 sheet.',
    widthMm: 210, heightMm: 148,
    jsPdfFormat: 'a5', jsPdfOrientation: 'landscape',
    cssClass: 'paper-a5-landscape',
    kind: 'sheet',
  },
  letter: {
    label: 'US Letter (216 × 279 mm)',
    hint: 'US / Canada / Mexico standard business size.',
    widthMm: 216, heightMm: 279,
    jsPdfFormat: 'letter', jsPdfOrientation: 'portrait',
    cssClass: 'paper-letter',
    kind: 'sheet',
  },
  legal: {
    label: 'US Legal (216 × 356 mm)',
    hint: 'Longer than Letter — useful for detailed invoices with many line items.',
    widthMm: 216, heightMm: 356,
    jsPdfFormat: 'legal', jsPdfOrientation: 'portrait',
    cssClass: 'paper-legal',
    kind: 'sheet',
  },
  b5: {
    label: 'B5 (176 × 250 mm)',
    hint: 'Between A5 and A4 — used in some Asian markets.',
    widthMm: 176, heightMm: 250,
    jsPdfFormat: 'b5', jsPdfOrientation: 'portrait',
    cssClass: 'paper-b5',
    kind: 'sheet',
  },
  thermal80: {
    label: '80mm Thermal (POS receipt)',
    hint: '80 mm wide roll · ~72 mm printable area. Standard restaurant / retail POS printers.',
    widthMm: 72, heightMm: 297,
    jsPdfFormat: [72, 297], jsPdfOrientation: 'portrait',
    cssClass: 'paper-thermal-80',
    kind: 'thermal',
  },
  thermal76: {
    label: '76mm Thermal (kitchen printer)',
    hint: '76 mm wide roll · ~68 mm printable area.',
    widthMm: 68, heightMm: 297,
    jsPdfFormat: [68, 297], jsPdfOrientation: 'portrait',
    cssClass: 'paper-thermal-76',
    kind: 'thermal',
  },
  thermal58: {
    label: '58mm Thermal (compact / mobile)',
    hint: '58 mm wide roll · ~48 mm printable area.',
    widthMm: 48, heightMm: 297,
    jsPdfFormat: [48, 297], jsPdfOrientation: 'portrait',
    cssClass: 'paper-thermal-58',
    kind: 'thermal',
  },
  thermal112: {
    label: '112mm Thermal (wide receipt)',
    hint: '112 mm wide roll · ~104 mm printable area.',
    widthMm: 104, heightMm: 297,
    jsPdfFormat: [104, 297], jsPdfOrientation: 'portrait',
    cssClass: 'paper-thermal-112',
    kind: 'thermal',
  },
  custom: {
    label: 'Custom Size',
    hint: 'Specify custom width & height',
    widthMm: 80, heightMm: 297,
    jsPdfFormat: [80, 297], jsPdfOrientation: 'portrait',
    cssClass: 'paper-custom',
    kind: 'custom',
  },
};

export const getPaperSize = (key: string, options: any = {}) => {
  const base = PAPER_SIZES[key] || PAPER_SIZES.a4;
  if (base.kind !== 'custom') return base;
  const w = Math.max(30, Math.min(500, Number(options.customPaperWidth) || 80));
  const h = Math.max(50, Math.min(1200, Number(options.customPaperHeight) || 297));
  const kind = w < 100 ? 'thermal' : 'sheet';
  return {
    ...base,
    widthMm: w, heightMm: h,
    jsPdfFormat: [w, h],
    kind,
    cssClass: kind === 'thermal' ? 'paper-thermal-custom' : 'paper-custom',
  };
};

export const FEATURE_GROUPS = [
  {
    id: 'sales',
    label: 'Sales & Invoicing',
    description: 'Invoice creation, recurring invoices, payment receipts',
    modules: [
      { id: 'invoicing', label: 'Tax invoices, proforma, credit notes', nav: 'new', core: true },
      { id: 'recurring', label: 'Recurring invoices', nav: 'recurring', defaultOn: true },
      { id: 'receipts',  label: 'Payment receipts',  nav: 'receipts',  defaultOn: true },
    ],
  },
  {
    id: 'directory',
    label: 'Directory',
    description: 'Clients and product catalog',
    modules: [
      { id: 'clients',   label: 'Clients',   nav: 'clients', core: true },
      { id: 'inventory', label: 'Products & Services (inventory)', nav: 'inventory', defaultOn: true },
    ],
  },
  {
    id: 'purchases',
    label: 'Purchases & Expenses',
    description: 'Vendor bills, expense tracking, ITC',
    modules: [
      { id: 'expenses',  label: 'Expense tracker', nav: 'expenses',  defaultOn: true },
      { id: 'purchases', label: 'Purchase bills',  nav: 'purchases', defaultOn: true },
      { id: 'gstr2b',    label: 'GSTR-2B reconciliation (purchase ITC matching)', nav: null, defaultOn: true, indiaOnly: true },
    ],
  },
  {
    id: 'gst',
    label: 'GST & Tax (India)',
    description: 'GSTR returns, e-Way Bill, TDS/TCS, HSN summaries',
    modules: [
      { id: 'gstReturns', label: 'GSTR-1 / GSTR-3B exports + filing guide', nav: 'filing', defaultOn: true, indiaOnly: true },
      { id: 'ewayBill',   label: 'E-Way Bill JSON export', nav: null, defaultOn: true, indiaOnly: true },
      { id: 'tdsTcs',     label: 'TDS / TCS on invoices', nav: null, defaultOn: false, indiaOnly: true },
      { id: 'incomeTax',  label: 'Income Tax Helper (regime calc + bank import)', nav: 'incometax', defaultOn: true, indiaOnly: true },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Dashboards and financial reports',
    modules: [
      { id: 'dashboard', label: 'Dashboard', nav: 'dashboard', core: true },
      { id: 'reports',   label: 'Reports view', nav: 'reports', defaultOn: true },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'Cloud backup and payment QR codes',
    modules: [
      { id: 'googleDrive', label: 'Google Drive backup', nav: null, defaultOn: true },
      { id: 'upiQr',       label: 'UPI QR code on invoices', nav: null, defaultOn: true, indiaOnly: true },
    ],
  },
];

const ALL_MODULES = FEATURE_GROUPS.flatMap(g => g.modules.map(m => ({ ...m, group: g.id })));

export const isModuleEnabled = (moduleId: string, userMap: Record<string, boolean> = {}) => {
  const mod = ALL_MODULES.find(m => m.id === moduleId);
  if (!mod) return true;
  if (mod.core) return true;
  if (Object.prototype.hasOwnProperty.call(userMap, moduleId)) return !!userMap[moduleId];
  return mod.defaultOn !== false;
};

export const reorderAccounts = (accounts: any[], fromIdx: number, toIdx: number): any[] => {
  if (!Array.isArray(accounts)) return accounts;
  if (fromIdx === toIdx || fromIdx < 0 || fromIdx >= accounts.length) return accounts;
  if (toIdx < 0 || toIdx >= accounts.length) return accounts;
  const next = accounts.slice();
  const [moved] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, moved);
  return next;
};

export const setDefaultAccount = (accounts: any[], accountId?: string): any[] => {
  if (!Array.isArray(accounts) || !accountId) return accounts;
  if (!accounts.some(a => a.id === accountId)) return accounts;
  return accounts.map(a => ({ ...a, isDefault: a.id === accountId }));
};

export function getPaymentAccounts(profile: any) {
  if (!profile) return [];
  if (Array.isArray(profile.paymentAccounts) && profile.paymentAccounts.length > 0) {
    return profile.paymentAccounts;
  }
  if (profile.bankName || profile.bankAccountNo || profile.upiId) {
    return [{
      id: 'default_legacy',
      label: 'Primary Account',
      accountName: profile.accountHolderName || profile.businessName || '',
      accountNumber: profile.bankAccountNo || '',
      ifsc: profile.bankIfsc || '',
      bankName: profile.bankName || '',
      branch: profile.bankBranch || '',
      upiId: profile.upiId || '',
      isDefault: true,
    }];
  }
  return [];
}
