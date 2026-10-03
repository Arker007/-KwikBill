import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  numberToWords,
  formatCurrency,
  getCountryConfig,
  CURRENCY_NAMES,
  getAccountById,
} from '@/shared/utils';
import { INVOICE_TYPES } from '@/features/invoices/constants';
import { getPaperSize, getPrintSettings } from '@/features/invoices/utils/printSettings';
import { ThermalReceipt } from './ThermalReceipt';
import { templateRegistry, ExtraSection, InvoiceTemplateProps } from '@/features/invoices/templates';

export type { ExtraSection };

export interface InvoicePreviewProps {
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
}

export const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(({
  profile,
  client,
  details,
  items = [],
  totals = {} as any,
  invoiceType = 'tax-invoice',
  customTerms,
  customNotes,
  extraSections = [],
  options = {} as any,
  previewOnly = false,
}, ref) => {
  const businessState = profile?.state?.trim().toLowerCase();
  const clientState = client?.state?.trim().toLowerCase();
  const isInterstate =
    (typeof totals?.igst === 'number' && totals.igst > 0) ||
    !!client?.isSEZ ||
    (details?.placeOfSupply && businessState && details.placeOfSupply.toLowerCase() !== businessState) ||
    (businessState && clientState && businessState !== clientState);

  const typeConfig =
    (INVOICE_TYPES as Record<string, any>)[invoiceType] ||
    (INVOICE_TYPES as Record<string, any>)['tax-invoice'];
  const sellerCC = getCountryConfig(profile?.country);
  const isIndia = (profile?.country || 'India') === 'India';
  const taxLabel = sellerCC.taxLabel || 'GST';

  const account = options.paymentAccountSnapshot || getAccountById(profile, options.selectedAccountId);
  const showAccountLabel = options.showAccountLabel === true;

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
  const showSignatoryText = opt('showSignatoryText');
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
  const customTitle = options.customTitle || typeConfig.title;
  const currencySymbol = options.currency || 'INR';

  const showReverseChargeLine = isIndia && showGST && (invoiceType === 'tax-invoice' || invoiceType === 'credit-note');
  const reverseChargeText = options.reverseCharge ? 'Yes' : 'No';

  const fmt = (amount: number) => {
    if (currencySymbol === 'INR') return formatCurrency(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencySymbol,
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const _ps = getPrintSettings();
  const _ps_dc = _ps;
  const _ps_labels = _ps_dc;
  const dualCurrencyOn =
    _ps_dc.dualCurrencyEnabled &&
    currencySymbol === 'INR' &&
    _ps_dc.dualCurrencyCode &&
    Number(_ps_dc.dualCurrencyRate) > 0;

  const fmtDualSecondary = (amount: number) => {
    if (!dualCurrencyOn || _ps_dc.dualCurrencyPosition !== 'below') return '';
    const secondary = (Number(amount) || 0) / Number(_ps_dc.dualCurrencyRate);
    return (
      '≈ ' +
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: _ps_dc.dualCurrencyCode,
        minimumFractionDigits: 2,
      }).format(secondary)
    );
  };

  const amountInWords = (num: number) => {
    if (currencySymbol === 'INR') return numberToWords(num);
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const convert = (n: number): string => {
      if (n === 0) return 'Zero';
      let result = '';
      if (n >= 1000000) {
        result += convert(Math.floor(n / 1000000)) + ' Million ';
        n %= 1000000;
      }
      if (n >= 1000) {
        result += convert(Math.floor(n / 1000)) + ' Thousand ';
        n %= 1000;
      }
      if (n >= 100) {
        result += a[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += b[Math.floor(n / 10)] + ' ';
        if (n % 10) result += a[n % 10] + ' ';
      } else if (n > 0) {
        result += a[n] + ' ';
      }
      return result.trim();
    };
    const names = (CURRENCY_NAMES as Record<string, any>)[currencySymbol] || { major: currencySymbol, minor: 'Cents' };
    const rounded = Math.round(num * 100) / 100;
    const whole = Math.floor(rounded);
    const cents = Math.round((rounded - whole) * 100);
    let result = convert(whole) + ' ' + names.major;
    if (cents > 0) result += ' and ' + convert(cents) + ' ' + names.minor;
    return result + ' Only';
  };

  const [qrDataUrl, setQrDataUrl] = useState('');
  const upiId = account?.upiId || profile?.upiId || '';

  useEffect(() => {
    if (!showUPI || !upiId || !totals.total || currencySymbol !== 'INR') {
      setQrDataUrl('');
      return;
    }
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      profile?.businessName || ''
    )}&am=${totals.total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
      `Payment for ${details?.invoiceNumber || 'Invoice'}`
    )}`;
    QRCode.toDataURL(upiUrl, { width: 120, margin: 1, errorCorrectionLevel: 'M' })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [showUPI, upiId, profile?.businessName, totals.total, details?.invoiceNumber, currencySymbol]);

  const accentColors: Record<string, string> = {
    'tax-invoice': '#1e40af',
    proforma: '#7c3aed',
    'bill-of-supply': '#0f766e',
    'credit-note': '#be123c',
  };

  const accent =
    options.accentColor ||
    (_ps.userColorsEnabled && _ps.pdfAccent) ||
    accentColors[invoiceType] ||
    accentColors['tax-invoice'];

  const pdfStyleRaw = options.pdfStyle || _ps.pdfTemplate || 'classic';
  const pdfStyle = ['corporate', 'minimalist'].includes(pdfStyleRaw)
    ? pdfStyleRaw === 'corporate'
      ? 'classic'
      : 'minimal'
    : pdfStyleRaw;
  const pdfStyleVariant = pdfStyleRaw;

  const hasAnyDiscount = showDiscount && items.some((item: any) => (item.discount || 0) > 0);

  const paperCfg = getPaperSize(options.paperSize, options);
  const isThermal = paperCfg.kind === 'thermal';

  const containerStyle: React.CSSProperties = {
    width: `${paperCfg.widthMm}mm`,
    minHeight: paperCfg.kind === 'sheet' ? `${paperCfg.heightMm}mm` : undefined,
    ...(isThermal ? { fontFamily: '"Courier New", monospace', fontSize: paperCfg.widthMm >= 80 ? '10.5px' : '9px' } : {}),
  };

  if (isThermal) {
    return (
      <ThermalReceipt
        ref={ref}
        profile={profile}
        client={client}
        details={details}
        items={items}
        totals={totals}
        invoiceType={invoiceType}
        customNotes={customNotes}
        options={options}
        previewOnly={previewOnly}
        containerStyle={containerStyle}
        paperCfg={paperCfg}
        upiId={upiId}
        qrDataUrl={qrDataUrl}
        amountInWords={amountInWords}
        account={account}
        typeConfig={typeConfig}
        opt={opt}
        _ps={_ps}
      />
    );
  }

  const _ps_final = _ps;
  const letterheadOn = _ps_final.letterheadEnabled && _ps_final.letterheadImage;
  const hideHeaderBecauseLetterhead = letterheadOn && _ps_final.letterheadHideHeader;

  const PDF_FAMILY_MAP: Record<string, string> = {
    helvetica: 'Helvetica, Arial, "Segoe UI", sans-serif',
    times: '"Times New Roman", Times, "Liberation Serif", serif',
    courier: '"Courier New", Courier, "Liberation Mono", monospace',
  };
  const pdfFontFamilyCss = !isThermal
    ? PDF_FAMILY_MAP[_ps_final.pdfFontFamily] || PDF_FAMILY_MAP.helvetica
    : undefined;

  const PDF_FONT_SIZE_PCT: Record<string, number> = { small: 87, medium: 100, large: 112, xlarge: 122 };
  const basePct = !isThermal ? PDF_FONT_SIZE_PCT[_ps_final.fontSize] || 100 : 100;
  const pdfFontSizeCss = !isThermal ? `${basePct}%` : undefined;

  const PDF_FONT_WEIGHT: Record<string, number> = { normal: 400, bold: 600, ultra: 800 };
  const pdfFontWeightCss = !isThermal ? PDF_FONT_WEIGHT[_ps_final.fontWeight] || 400 : undefined;
  const pdfCapsOn = !isThermal && _ps_final.allCaps === true;

  const explicitMode = options.termsFormatMode || _ps_final.termsFormatMode;
  const isServicesInvoice = (options.invoiceMode || 'goods') === 'services';
  const termsFormatMode = explicitMode || (isServicesInvoice ? 'formatted' : 'compact');
  const termsClassMod = termsFormatMode === 'formatted' ? 'inv-terms-formatted' : '';

  const finalContainerStyle: React.CSSProperties = {
    ...containerStyle,
    ...(letterheadOn
      ? {
          backgroundImage: `url(${_ps_final.letterheadImage})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
        }
      : {}),
    ...(_ps_final.userColorsEnabled
      ? (() => {
          const acc = _ps_final.pdfAccent || '#1e40af';
          const hex = acc.startsWith('#') ? acc.slice(1) : '';
          const rgb =
            hex.length === 6
              ? `${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)}`
              : '30, 64, 175';
          return {
            '--pdf-primary-text': _ps_final.pdfPrimaryText || '#0f172a',
            '--pdf-muted-text': _ps_final.pdfMutedText || '#334155',
            '--pdf-accent': acc,
            '--pdf-accent-rgb': rgb,
            '--pdf-accent-text': _ps_final.pdfAccentText || '#ffffff',
            '--pdf-header-bg': _ps_final.pdfHeaderBg || '#f8fafc',
            '--pdf-divider': _ps_final.pdfDividerColor || '#334155',
          } as React.CSSProperties;
        })()
      : {}),
    ...(pdfFontFamilyCss ? { fontFamily: pdfFontFamilyCss } : {}),
    ...(pdfFontSizeCss ? { fontSize: pdfFontSizeCss } : {}),
    ...(pdfFontWeightCss ? { fontWeight: pdfFontWeightCss } : {}),
    ...(pdfCapsOn ? { textTransform: 'uppercase' } : {}),
  };

  // Fetch complete template design
  const TemplateComponent = templateRegistry[pdfStyle] || templateRegistry.classic;

  const templateProps: InvoiceTemplateProps = {
    profile,
    client,
    details,
    items,
    totals,
    invoiceType,
    customTerms,
    customNotes,
    extraSections,
    options,
    previewOnly,
    accent,
    customTitle,
    sellerCC,
    isIndia,
    taxLabel,
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
    showSignatoryText,
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
    showReverseChargeLine,
    reverseChargeText,
    isInterstate,
    businessState,
    clientState,
    hasAnyDiscount,
    dualCurrencyOn,
    hideHeaderBecauseLetterhead,
    account,
    showAccountLabel,
    upiId,
    qrDataUrl,
    fmt,
    fmtDualSecondary,
    amountInWords,
    typeConfig,
    termsFormatMode,
    termsClassMod,
    _ps,
    _ps_labels,
  };

  return (
    <div
      className={`invoice-preview-container ${paperCfg.cssClass} template-${pdfStyleVariant}`}
      data-user-colors={_ps_final.userColorsEnabled ? '1' : '0'}
      data-row-density={_ps_final.rowDensity || 'normal'}
      data-header-compact={_ps_final.headerCompact ? '1' : '0'}
      ref={ref}
      id="invoice-preview"
      style={finalContainerStyle}
    >
      <TemplateComponent {...templateProps} />
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';
export default InvoicePreview;
