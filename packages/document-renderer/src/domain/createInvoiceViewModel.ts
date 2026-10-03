import {
  numberToWords,
  formatCurrency,
  getCountryConfig,
  CURRENCY_NAMES,
  getAccountById,
  getPaperSize,
} from '@/shared/utils';
import { getPrintSettings } from '@/features/invoices/utils/printSettings';
import { INVOICE_TYPES } from '@/features/invoices/constants';

export interface InvoiceViewModel {
  profile: any;
  client: any;
  details: any;
  items: any[];
  totals: any;
  invoiceType: string;
  invoiceTypeLabel: string;
  customTitle: string;
  invoiceNumber: string;
  formattedDate: string;
  formattedDueDate: string;
  currencySymbol: string;
  paperCfg: any;
  isThermal: boolean;
  accentColor: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  allCaps: boolean;
  amountInWords: string;
  account: any;
  upiId: string;
  qrPayload: string;
  customTerms: string;
  customNotes: string;
  extraSections: any[];
  options: any;
  printSettings: any;
  showGST: boolean;
  showState: boolean;
  showGSTIN: boolean;
  showPlaceOfSupply: boolean;
  showHSN: boolean;
  showDiscount: boolean;
  showBankDetails: boolean;
  showUPI: boolean;
  showLogo: boolean;
  showSignature: boolean;
  showTerms: boolean;
  showNotes: boolean;
  showAmountWords: boolean;
  showDueDate: boolean;
  showItemQty: boolean;
  showItemUnit: boolean;
  showRateColumn: boolean;
  showSubtotal: boolean;
  showBusinessName: boolean;
  showBusinessAddress: boolean;
  showBusinessPhone: boolean;
  showBusinessEmail: boolean;
  showClientAddress: boolean;
  showClientPhone: boolean;
  showClientEmail: boolean;
  showInvoiceNumber: boolean;
  showInvoiceDate: boolean;
  isInterstate: boolean;
  taxLabel: string;
  sellerCC: ReturnType<typeof getCountryConfig>;
  formattedTotals: {
    subtotal: string;
    totalTax: string;
    cgst: string;
    sgst: string;
    utgst: string;
    igst: string;
    cess: string;
    discount: string;
    roundOff: string;
    total: string;
    tds: string;
    tcs: string;
  };
  formattedItems: Array<{
    id: string;
    name: string;
    hsn: string;
    quantity: number;
    unit: string;
    rate: string;
    discount: string;
    taxPercent: number;
    taxAmount: string;
    amount: string;
    rawItem: any;
  }>;
}

export function createInvoiceViewModel(
  invoiceData: {
    profile?: any;
    client?: any;
    details?: any;
    items?: any[];
    totals?: any;
    invoiceType?: string;
    customTerms?: string;
    customNotes?: string;
    extraSections?: any[];
    options?: any;
  },
  overridePrintSettings?: any
): InvoiceViewModel {
  const profile = invoiceData.profile || {};
  const client = invoiceData.client || {};
  const details = invoiceData.details || {};
  const items = invoiceData.items || [];
  const totals = invoiceData.totals || {};
  const invoiceType = invoiceData.invoiceType || 'tax-invoice';
  const options = invoiceData.options || {};
  const printSettings = { ...getPrintSettings(), ...(overridePrintSettings || {}) };

  const typeConfig =
    (INVOICE_TYPES as Record<string, any>)[invoiceType] ||
    (INVOICE_TYPES as Record<string, any>)['tax-invoice'];

  const sellerCC = getCountryConfig(profile?.country);
  const taxLabel = sellerCC.taxLabel || 'GST';

  const businessState = profile?.state?.trim().toLowerCase();
  const clientState = client?.state?.trim().toLowerCase();
  const isInterstate =
    (typeof totals?.igst === 'number' && totals.igst > 0) ||
    !!client?.isSEZ ||
    (details?.placeOfSupply && businessState && details.placeOfSupply.toLowerCase() !== businessState) ||
    (businessState && clientState && businessState !== clientState);

  const opt = (key: string, fallback = true) => (options[key] !== undefined ? options[key] : fallback);

  const showGST = opt('showGST', typeConfig.showGST);
  const showState = opt('showState');
  const showGSTIN = opt('showGSTIN');
  const showPlaceOfSupply = opt('showPlaceOfSupply', showGST);
  const showHSN = opt('showHSN');
  const showDiscount = opt('showDiscount');
  const showBankDetails = opt('showBankDetails');
  const showUPI = opt('showUPI');
  const showLogo = opt('showLogo');
  const showSignature = opt('showSignature');
  const showTerms = opt('showTerms');
  const showNotes = opt('showNotes');
  const showAmountWords = opt('showAmountWords');
  const showDueDate = opt('showDueDate');
  const showItemQty = opt('showItemQty');
  const showItemUnit = opt('showItemUnit');
  const showRateColumn = opt('showRateColumn');
  const showSubtotal = opt('showSubtotal');

  const showBusinessName = opt('showBusinessName');
  const showBusinessAddress = opt('showBusinessAddress');
  const showBusinessPhone = opt('showBusinessPhone');
  const showBusinessEmail = opt('showBusinessEmail');
  const showClientAddress = opt('showClientAddress');
  const showClientPhone = opt('showClientPhone');
  const showClientEmail = opt('showClientEmail');
  const showInvoiceNumber = opt('showInvoiceNumber');
  const showInvoiceDate = opt('showInvoiceDate');

  const customTitle = options.customTitle || typeConfig.title || typeConfig.label || 'TAX INVOICE';
  const currencySymbol = options.currency || 'INR';

  const account = options.paymentAccountSnapshot || getAccountById(profile, options.selectedAccountId);
  const upiId = account?.upiId || profile?.upiId || '';

  const paperCfg = getPaperSize(options.paperSize, options);
  const isThermal = paperCfg.kind === 'thermal';

  const accentColors: Record<string, string> = {
    'tax-invoice': '#1e40af',
    proforma: '#7c3aed',
    'bill-of-supply': '#0f766e',
    'credit-note': '#be123c',
  };

  const accentColor =
    options.accentColor ||
    (printSettings.userColorsEnabled && printSettings.pdfAccent) ||
    accentColors[invoiceType] ||
    '#1e40af';

  const fmt = (amount: number) => {
    if (currencySymbol === 'INR') return formatCurrency(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencySymbol,
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const calculateAmountInWords = (num: number) => {
    if (currencySymbol === 'INR') return numberToWords(num);
    const names = (CURRENCY_NAMES as Record<string, any>)[currencySymbol] || { major: currencySymbol, minor: 'Cents' };
    return `${fmt(num)} (${names.major})`;
  };

  const qrPayload = printSettings.invoiceQrUrl
    ? printSettings.invoiceQrUrl.replace(/\{invoice_number\}/g, encodeURIComponent(details.invoiceNumber || ''))
    : details.invoiceNumber || '';

  const formattedItems = items.map((item: any, idx: number) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discount) || 0;
    const itemSubtotal = qty * rate - discount;
    const taxPercent = Number(item.taxPercent) || 0;
    const taxAmount = (itemSubtotal * taxPercent) / 100;
    const itemTotal = itemSubtotal + taxAmount;

    return {
      id: item.id || `item_${idx}`,
      name: item.name || '',
      hsn: item.hsn || '',
      quantity: qty,
      unit: item.unit || 'Pcs',
      rate: fmt(rate),
      discount: discount > 0 ? fmt(discount) : '-',
      taxPercent,
      taxAmount: fmt(taxAmount),
      amount: fmt(itemTotal),
      rawItem: item,
    };
  });

  return {
    profile,
    client,
    details,
    items,
    totals,
    invoiceType,
    invoiceTypeLabel: typeConfig.label || 'Invoice',
    customTitle,
    invoiceNumber: details.invoiceNumber || 'DRAFT',
    formattedDate: details.invoiceDate || new Date().toISOString().split('T')[0],
    formattedDueDate: details.dueDate || '',
    currencySymbol,
    paperCfg,
    isThermal,
    accentColor,
    fontFamily: printSettings.pdfFontFamily || 'helvetica',
    fontSize: printSettings.fontSize || 'medium',
    fontWeight: printSettings.fontWeight || 'normal',
    allCaps: !!printSettings.allCaps,
    amountInWords: calculateAmountInWords(Number(totals.total) || 0),
    account,
    upiId,
    qrPayload,
    customTerms: invoiceData.customTerms || '',
    customNotes: invoiceData.customNotes || '',
    extraSections: invoiceData.extraSections || [],
    options,
    printSettings,
    showGST,
    showState,
    showGSTIN,
    showPlaceOfSupply,
    showHSN,
    showDiscount,
    showBankDetails,
    showUPI,
    showLogo,
    showSignature,
    showTerms,
    showNotes,
    showAmountWords,
    showDueDate,
    showItemQty,
    showItemUnit,
    showRateColumn,
    showSubtotal,
    showBusinessName,
    showBusinessAddress,
    showBusinessPhone,
    showBusinessEmail,
    showClientAddress,
    showClientPhone,
    showClientEmail,
    showInvoiceNumber,
    showInvoiceDate,
    isInterstate,
    taxLabel,
    sellerCC,
    formattedTotals: {
      subtotal: fmt(Number(totals.subtotal) || 0),
      totalTax: fmt(Number(totals.totalTaxAmount) || 0),
      cgst: fmt(Number(totals.cgst) || 0),
      sgst: fmt(Number(totals.sgst) || 0),
      utgst: fmt(Number(totals.utgst) || 0),
      igst: fmt(Number(totals.igst) || 0),
      cess: fmt(Number(totals.cess) || 0),
      discount: fmt(Number(totals.discount) || 0),
      roundOff: fmt(Number(totals.roundOff) || 0),
      total: fmt(Number(totals.total) || 0),
      tds: fmt(Number(totals.tdsAmount) || 0),
      tcs: fmt(Number(totals.tcsAmount) || 0),
    },
    formattedItems,
  };
}
