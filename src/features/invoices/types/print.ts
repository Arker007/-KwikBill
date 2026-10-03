/**
 * Thermal and PDF print configuration settings.
 */
export interface PrintSettings {
  // Thermal typography & layout
  fontFamily?: 'mono' | 'sans';
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  fontWeight?: 'normal' | 'bold' | 'ultra';
  allCaps?: boolean;
  lineSpacing?: 'compact' | 'normal' | 'comfortable';
  headerAlign?: 'left' | 'center';
  contrast?: 'normal' | 'high' | 'ultra';

  // Thermal content toggles
  showHSN?: boolean;
  showRateLine?: boolean;
  showAmountWords?: boolean;
  showUPI?: boolean;
  qrSize?: 'small' | 'medium' | 'large';
  showLogo?: boolean;
  showBankDetails?: boolean;

  // Thermal header & footer
  footerMessage?: string;
  cutMark?: boolean;
  feedLines?: number;
  headerCaps?: boolean;
  showTagline?: boolean;
  tagline?: string;

  // PDF & universal print options
  autoPrintOnSave?: boolean;
  watermarkEnabled?: boolean;
  watermarkText?: string;
  watermarkOpacity?: number;
  watermarkAngle?: number;
  watermarkFontSize?: number;

  multiCopyEnabled?: boolean;
  multiCopyCount?: number;
  multiCopyLabels?: string[];

  pageNumbersEnabled?: boolean;
  pageHeaderEnabled?: boolean;

  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;

  pdfFontFamily?: 'helvetica' | 'times' | 'courier';

  invoiceBarcodeEnabled?: boolean;
  invoiceQrEnabled?: boolean;
  invoiceQrUrl?: string;

  signatureImage?: string;
  signatureName?: string;
  signatureShow?: boolean;

  termsSeparatePage?: boolean;
  termsFormatMode?: 'compact' | 'formatted';

  feedbackQrEnabled?: boolean;
  feedbackQrUrl?: string;
  feedbackQrLabel?: string;
}
