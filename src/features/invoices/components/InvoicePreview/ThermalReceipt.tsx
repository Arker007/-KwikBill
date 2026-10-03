import React from 'react';
import DOMPurify from 'dompurify';
import { getCountryConfig } from '@/shared/utils';

const ACCOUNT_TYPE_MAP: Record<string, string> = {
  savings: 'Sav',
  current: 'Cur',
  cc: 'CC',
  od: 'OD',
  nre: 'NRE',
  nro: 'NRO',
};

export interface ThermalReceiptProps {
  profile?: any;
  client?: any;
  details?: any;
  items?: any[];
  totals?: any;
  invoiceType?: string;
  customNotes?: string;
  options?: any;
  previewOnly?: boolean;
  containerStyle: React.CSSProperties;
  paperCfg: any;
  upiId: string;
  qrDataUrl: string;
  amountInWords: (num: number) => string;
  account?: any;
  typeConfig: any;
  opt: (key: string, fallback?: boolean) => any;
  _ps: any;
}

export const ThermalReceipt = React.forwardRef<HTMLDivElement, ThermalReceiptProps>(({
  profile,
  client,
  details,
  items = [],
  totals = {} as any,
  invoiceType = 'tax-invoice',
  customNotes,
  options = {} as any,
  previewOnly = false,
  containerStyle,
  paperCfg,
  upiId,
  qrDataUrl,
  amountInWords,
  account,
  typeConfig,
  opt,
  _ps,
}, ref) => {
  const printSettings = _ps;
  const eff = {
    thermalFontSize: options.thermalFontSize ?? printSettings.fontSize,
    thermalFontFamily: options.thermalFontFamily ?? printSettings.fontFamily,
    thermalFontWeight: options.thermalFontWeight ?? printSettings.fontWeight,
    thermalAllCaps: options.thermalAllCaps ?? printSettings.allCaps,
    thermalLineSpacing: options.thermalLineSpacing ?? printSettings.lineSpacing,
    thermalContrast: options.thermalContrast ?? printSettings.contrast,
    thermalHeaderAlign: options.thermalHeaderAlign ?? printSettings.headerAlign,
    thermalHeaderCaps: options.thermalHeaderCaps ?? printSettings.headerCaps,
    thermalShowLogo: options.thermalShowLogo ?? printSettings.showLogo,
    thermalShowHSN: options.thermalShowHSN ?? printSettings.showHSN,
    thermalShowRate: options.thermalShowRate ?? printSettings.showRateLine,
    thermalQrSize: options.thermalQrSize ?? printSettings.qrSize,
    thermalCutMark: options.thermalCutMark ?? printSettings.cutMark,
    thermalFeedLines: options.thermalFeedLines ?? printSettings.feedLines,
    thermalFooterMessage: options.thermalFooterMessage ?? printSettings.footerMessage,
    thermalTagline: options.thermalTagline ?? (printSettings.showTagline ? printSettings.tagline : ''),
    thermalCompact: options.thermalCompact ?? false,
  };

  const invoiceNum = details?.invoiceNumber || '';
  const invoiceDate = details?.invoiceDate ? new Date(details.invoiceDate).toLocaleDateString('en-IN') : '';
  const sellerCurrency = getCountryConfig(profile?.country).currency;
  const currencySymbol = sellerCurrency === 'INR' ? 'Rs.' : sellerCurrency;
  const showRoundOff = opt('showRoundOff', false);

  const isVeryNarrow = paperCfg.widthMm < 60;
  const isNarrow = paperCfg.widthMm < 80;

  const fontSize = eff.thermalFontSize || 'medium';
  const fontFamily = eff.thermalFontFamily || 'mono';
  const fontWeight = eff.thermalFontWeight || 'bold';
  const allCaps = eff.thermalAllCaps === true;
  const lineSpacing = eff.thermalLineSpacing || 'normal';
  const contrast = eff.thermalContrast || 'normal';
  const headerAlign = eff.thermalHeaderAlign || 'center';
  const headerCaps = eff.thermalHeaderCaps !== false;
  const showLogo = eff.thermalShowLogo !== false;
  const showHSN = eff.thermalShowHSN !== false;
  const showRate = eff.thermalShowRate !== false;
  const qrSizePx = eff.thermalQrSize === 'small' ? 60
                 : eff.thermalQrSize === 'large' ? 120 : 90;
  const cutMark = eff.thermalCutMark !== false;
  const feedLines = Number(eff.thermalFeedLines ?? 2);
  const footerMessage = eff.thermalFooterMessage || 'Thank you for your business!';
  const tagline = eff.thermalTagline || '';
  const thermalCompact = !!eff.thermalCompact;

  const fontSizeMap: Record<string, number> = {
    small: isVeryNarrow ? 9.5 : 11,
    medium: isVeryNarrow ? 11 : 12.5,
    large: isVeryNarrow ? 12.5 : 14.5,
    xlarge: isVeryNarrow ? 14 : 16.5,
  };
  const fontSizeBase = (fontSizeMap[fontSize] || fontSizeMap.medium) + 'px';

  const fontFamilyCss = fontFamily === 'sans'
    ? '"Arial", "Helvetica", sans-serif'
    : '"Courier New", "Consolas", monospace';

  const baseWeight = fontWeight === 'ultra' ? 800
                   : fontWeight === 'normal' ? 500
                   : 700;
  const strongWeight = Math.min(900, baseWeight + 200);
  const contrastFilter = contrast === 'ultra' ? 'grayscale(1) contrast(3) brightness(0.85)'
                      : contrast === 'high' ? 'grayscale(1) contrast(2) brightness(0.95)'
                      : 'grayscale(1) contrast(1.4)';

  const lineHeight = lineSpacing === 'compact' ? 1.2
                   : lineSpacing === 'comfortable' ? 1.6 : 1.4;
  const secPad = lineSpacing === 'compact' ? '3px 4px'
               : lineSpacing === 'comfortable' ? '8px 4px' : '5px 4px';

  const cap = (s: any) => allCaps ? String(s || '').toUpperCase() : String(s || '');
  const dashLine = { borderBottom: '1px solid #000', borderTop: 'none' };

  const textDarkenShadow = fontWeight === 'normal' ? 'none'
                         : '0.6px 0 0 currentColor, 0 0.6px 0 currentColor, 0.4px 0.4px 0 currentColor';

  const rootStyle: React.CSSProperties = {
    ...containerStyle,
    color: '#000',
    background: '#fff',
    fontFamily: fontFamilyCss,
    fontSize: fontSizeBase,
    fontWeight: baseWeight,
    lineHeight,
    letterSpacing: allCaps ? '0.02em' : 0,
    textShadow: textDarkenShadow,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  };

  const showAmountWords = opt('showAmountWords');
  const showBankDetails = opt('showBankDetails');
  const showNotes = opt('showNotes');

  return (
    <div
      className={`invoice-preview-container ${paperCfg.cssClass} paper-thermal`}
      ref={ref}
      {...(previewOnly ? {} : { id: 'invoice-preview' })}
      style={rootStyle}
    >
      {/* ================= HEADER ================= */}
      <div style={{ padding: '8px 4px 6px', textAlign: headerAlign as any, ...dashLine, color: '#000' }}>
        {showLogo && (options?.logo || profile?.logo) && (
          <img
            src={options?.logo || profile?.logo}
            alt=""
            className="thermal-logo"
            style={{
              maxHeight: options?.logoHeight || profile?.logoHeight ? Math.min(options?.logoHeight || profile?.logoHeight, 60) : 45,
              marginBottom: 4,
              filter: contrastFilter,
            }}
          />
        )}
        <div style={{ fontWeight: strongWeight, fontSize: '1.15em', letterSpacing: '0.02em' }}>
          {(headerCaps || allCaps) ? (profile?.businessName || '').toUpperCase() : (profile?.businessName || '')}
        </div>
        {tagline && <div style={{ fontSize: '0.85em', fontWeight: baseWeight, fontStyle: 'italic' }}>{cap(tagline)}</div>}
        {profile?.address && <div style={{ fontSize: '0.9em', fontWeight: baseWeight }}>{cap(profile.address)}</div>}
        {(profile?.city || profile?.state || profile?.pin) && (
          <div style={{ fontSize: '0.9em', fontWeight: baseWeight }}>
            {cap([profile?.city, profile?.state, profile?.pin].filter(Boolean).join(', '))}
          </div>
        )}
        {profile?.gstin && (
          <div style={{ fontSize: '0.9em', fontWeight: strongWeight, marginTop: 2 }}>{cap('GSTIN: ' + profile.gstin)}</div>
        )}
        {profile?.phone && <div style={{ fontSize: '0.9em', fontWeight: baseWeight }}>{cap('Ph: ' + profile.phone)}</div>}
      </div>

      {/* ================= TYPE BANNER ================= */}
      <div style={{ padding: secPad, textAlign: 'center', fontWeight: strongWeight, textTransform: 'uppercase', fontSize: '1.05em', letterSpacing: '0.08em', ...dashLine }}>
        {typeConfig?.label || 'Invoice'}
      </div>

      {/* ================= INVOICE DETAILS ================= */}
      <div style={{ padding: secPad, fontSize: '0.95em', fontWeight: baseWeight, ...dashLine }}>
        <div><strong style={{ fontWeight: strongWeight }}>{cap('Invoice #')}: </strong>{cap(invoiceNum)}</div>
        <div><strong style={{ fontWeight: strongWeight }}>{cap('Date')}: </strong>{cap(invoiceDate)}</div>
        {client?.name && (
          <div style={{ marginTop: 3 }}>
            <strong style={{ fontWeight: strongWeight }}>{cap('Bill to')}: </strong>{cap(client.name)}
          </div>
        )}
        {client?.gstin && <div>{cap('GSTIN: ' + client.gstin)}</div>}
        {client?.phone && <div>{cap('Ph: ' + client.phone)}</div>}
      </div>

      {/* ================= ITEMS ================= */}
      {(() => {
        const amountColMm = isNarrow ? 16 : paperCfg.widthMm < 100 ? 22 : 26;
        const gridCols = `1fr ${amountColMm}mm`;
        const showGST = opt('showGST', typeConfig?.showGST);
        return (
          <div style={{ padding: secPad, ...dashLine }}>
            <div style={{
              display: 'grid', gridTemplateColumns: gridCols,
              fontWeight: strongWeight, paddingBottom: 3, marginBottom: 3,
              borderBottom: '1px solid #000', fontSize: '0.95em',
              textTransform: 'uppercase', gap: '4px',
            }}>
              <span>Item</span>
              <span style={{ textAlign: 'right' }}>{isVeryNarrow ? 'Amt' : 'Amount'}</span>
            </div>
            {(items || []).map((item: any, idx: number) => {
              const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
              const qty = Number(item.quantity) || 0;
              const rate = Number(item.rate) || 0;
              const tax = showGST && item.taxPercent > 0 ? ` +${item.taxPercent}%` : '';
              const hsnBit = showHSN && item.hsn && !isVeryNarrow ? '  |  HSN ' + item.hsn : '';
              return (
                <div key={item.id || `thermal-item-${idx}`} style={{ marginBottom: 5, fontSize: '0.95em' }}>
                  <div style={{ fontWeight: strongWeight, wordBreak: 'break-word' }}>
                    {(idx + 1) + '. ' + cap(item.name || item.description || 'Item')}
                  </div>
                  <div style={{
                    display: 'grid', gridTemplateColumns: gridCols, gap: '4px',
                    fontSize: '0.92em', paddingLeft: thermalCompact ? 0 : 8, fontWeight: baseWeight,
                  }}>
                    <span style={{ wordBreak: 'break-word' }}>
                      {cap(showRate
                        ? `${qty}${item.unit ? ' ' + item.unit : ''} × ${currencySymbol}${rate.toFixed(2)}${tax}${hsnBit}`
                        : `${qty}${item.unit ? ' ' + item.unit : ''}${hsnBit}`)}
                    </span>
                    <span style={{ textAlign: 'right', fontWeight: strongWeight }}>{currencySymbol}{amount.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ================= TOTALS ================= */}
      {(() => {
        const totalsColMm = isNarrow ? 18 : paperCfg.widthMm < 100 ? 24 : 30;
        const gridCols = `1fr ${totalsColMm}mm`;
        const rowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: gridCols, gap: '4px' };
        const amt = (n: any) => currencySymbol + (Number(n) || 0).toFixed(2);
        const showGST = opt('showGST', typeConfig?.showGST);
        return (
          <div style={{ padding: secPad, fontSize: '1em', fontWeight: baseWeight, ...dashLine }}>
            <div style={rowStyle}>
              <span>{cap('Subtotal')}</span>
              <span style={{ textAlign: 'right' }}>{amt(totals?.subtotal)}</span>
            </div>
            {Number(totals?.totalDiscount) > 0 && (
              <div style={rowStyle}>
                <span>{cap('Discount')}</span>
                <span style={{ textAlign: 'right' }}>-{amt(totals.totalDiscount)}</span>
              </div>
            )}
            {showGST && Number(totals?.cgst) > 0 && (
              <div style={rowStyle}>
                <span>{cap('CGST')}</span>
                <span style={{ textAlign: 'right' }}>{amt(totals.cgst)}</span>
              </div>
            )}
            {showGST && Number(totals?.sgst) > 0 && (
              <div style={rowStyle}>
                <span>{cap('SGST')}</span>
                <span style={{ textAlign: 'right' }}>{amt(totals.sgst)}</span>
              </div>
            )}
            {showGST && Number(totals?.igst) > 0 && (
              <div style={rowStyle}>
                <span>{cap('IGST')}</span>
                <span style={{ textAlign: 'right' }}>{amt(totals.igst)}</span>
              </div>
            )}
            {Number(totals?.cess) > 0 && (
              <div style={rowStyle}>
                <span>{cap('Cess')}</span>
                <span style={{ textAlign: 'right' }}>{amt(totals.cess)}</span>
              </div>
            )}
            {showRoundOff && Number(totals?.roundOff) !== 0 && (
              <div style={rowStyle}>
                <span>{cap('Round-off')}</span>
                <span style={{ textAlign: 'right' }}>
                  {Number(totals.roundOff) > 0 ? '+' : ''}{amt(totals.roundOff)}
                </span>
              </div>
            )}
            <div style={{
              ...rowStyle,
              fontWeight: strongWeight, fontSize: '1.2em', marginTop: 4,
              paddingTop: 4, borderTop: '1px solid #000',
              borderBottom: '2px solid #000', paddingBottom: 4,
            }}>
              <span>{cap('TOTAL')}</span>
              <span style={{ textAlign: 'right' }}>{amt(totals?.total)}</span>
            </div>
          </div>
        );
      })()}

      {showAmountWords && (
        <div style={{ padding: secPad, fontSize: '0.9em', textAlign: 'center', ...dashLine, fontStyle: 'italic', fontWeight: baseWeight }}>
          {cap(amountInWords(totals?.total || 0))}
        </div>
      )}

      {showBankDetails && (account?.bankName || profile?.bankName) && (
        <div style={{ padding: secPad, fontSize: '0.9em', fontWeight: baseWeight, ...dashLine }}>
          <div style={{ fontWeight: strongWeight, textAlign: 'center', marginBottom: 3 }}>{cap('BANK DETAILS')}</div>
          {account?.accountHolderName && account.accountHolderName.trim() && (
            <div>{cap(account.accountHolderName)}</div>
          )}
          <div>{cap(account?.bankName || profile?.bankName)}</div>
          {(account?.accountNumber || profile?.accountNumber) && (
            <div>{cap('A/c: ' + (account?.accountNumber || profile?.accountNumber))}{
              account?.accountType ? ' · ' + cap((ACCOUNT_TYPE_MAP[account.accountType] || account.accountType)) : ''
            }</div>
          )}
          {(account?.ifsc || profile?.ifsc) && <div>{cap('IFSC: ' + (account?.ifsc || profile?.ifsc))}</div>}
        </div>
      )}

      {opt('showUPI') && qrDataUrl && (() => {
        const isCustomThermal = paperCfg.cssClass === 'paper-thermal-custom';
        const size = isCustomThermal
          ? Math.min(qrSizePx, Math.round(paperCfg.widthMm * 3.78 * 0.55))
          : (isNarrow ? Math.min(qrSizePx, 90) : qrSizePx);
        return (
          <div style={{ padding: secPad, textAlign: 'center', ...dashLine }}>
            <img src={qrDataUrl} alt="UPI QR" className="thermal-qr"
              style={{ width: size, height: size, filter: contrastFilter }} />
            <div style={{ fontSize: '0.85em', fontWeight: strongWeight }}>{cap('Scan to pay via UPI')}</div>
          </div>
        );
      })()}

      {showNotes && customNotes && (
        <div style={{ padding: secPad, fontSize: '0.9em', fontWeight: baseWeight, ...dashLine }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(customNotes) }} />
      )}

      {footerMessage && (
        <div style={{ padding: '6px 4px 6px', textAlign: 'center', fontSize: '0.95em', fontWeight: strongWeight }}>
          {cap(`*** ${footerMessage} ***`)}
          {profile?.email && <div style={{ fontWeight: baseWeight, marginTop: 2 }}>{cap(profile.email)}</div>}
        </div>
      )}

      {cutMark && (
        <div style={{ padding: '10px 4px 4px', textAlign: 'center', fontSize: '0.85em', letterSpacing: '0.15em', color: '#000', fontFamily: 'monospace', fontWeight: strongWeight }}>
          {'- - - - -  ✂  CUT HERE  ✂  - - - - -'}
        </div>
      )}

      {feedLines > 0 && (
        <div style={{ height: `${feedLines * 8}px` }} />
      )}
    </div>
  );
});

ThermalReceipt.displayName = 'ThermalReceipt';
