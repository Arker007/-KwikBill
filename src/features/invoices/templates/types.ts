import React from 'react';

export interface ExtraSection {
  id?: string;
  title?: string;
  content?: string;
}

export interface InvoiceHeaderProps {
  profile: any;
  client: any;
  details: any;
  invoiceType: string;
  options: any;
  accent: string;
  customTitle: string;
  sellerCC: any;
  isIndia: boolean;
  taxLabel: string;
  showGST: boolean;
  showState: boolean;
  showGSTIN: boolean;
  showPlaceOfSupply: boolean;
  showBusinessName: boolean;
  showBusinessAddress: boolean;
  showBusinessPhone: boolean;
  showBusinessEmail: boolean;
  showInvoiceNumber: boolean;
  showInvoiceDate: boolean;
  showDueDate: boolean;
  showReverseChargeLine: boolean;
  reverseChargeText: string;
  showLogo: boolean;
}

export interface InvoiceTemplateProps {
  profile?: any;
  client?: any;
  details?: any;
  items?: any[];
  totals?: any;
  invoiceType?: string;
  customTerms?: string;
  customNotes?: string;
  extraSections?: ExtraSection[];
  options?: any;
  previewOnly?: boolean;

  // Resolved styling & metadata
  accent: string;
  customTitle: string;
  sellerCC: any;
  isIndia: boolean;
  taxLabel: string;

  // Visibility toggles
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
  showSignatoryText: boolean;
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
  showReverseChargeLine: boolean;
  reverseChargeText: string;

  // State & tax indicators
  isInterstate: boolean;
  businessState?: string;
  clientState?: string;
  hasAnyDiscount: boolean;
  dualCurrencyOn: boolean;
  hideHeaderBecauseLetterhead: boolean;

  // Banking & Payment
  account?: any;
  showAccountLabel: boolean;
  upiId: string;
  qrDataUrl: string;

  // Formatted helpers
  fmt: (amount: number) => string;
  fmtDualSecondary: (amount: number) => string;
  amountInWords: (num: number) => string;
  typeConfig: any;
  termsFormatMode: string;
  termsClassMod: string;

  // Print settings & labels
  _ps: any;
  _ps_labels: any;
}
