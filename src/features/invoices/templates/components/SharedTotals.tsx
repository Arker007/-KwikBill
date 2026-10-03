import React from 'react';
import { getLabel } from '@/features/invoices/utils/printSettings';
import { InvoiceTemplateProps } from '../types';

export interface SharedTotalsProps {
  props: InvoiceTemplateProps;
  containerStyle?: React.CSSProperties;
  className?: string;
  totalRowVariant?: 'classic' | 'modern' | 'minimal' | 'evergreen';
}

export const SharedTotals: React.FC<SharedTotalsProps> = ({
  props,
  containerStyle,
  className,
  totalRowVariant = 'classic',
}) => {
  const {
    totals = {} as any,
    showAmountWords,
    showSubtotal,
    showGST,
    isIndia,
    isInterstate,
    taxLabel,
    invoiceType,
    accent,
    options = {},
    amountInWords,
    dualCurrencyOn,
    fmtDualSecondary,
    fmt,
    qrDataUrl,
    upiId,
    _ps_labels,
  } = props;

  return (
    <div className={`inv-totals-section ${className || ''}`} style={containerStyle}>
      <div className="inv-words">
        {showAmountWords && (
          <>
            <h4 className="inv-section-label">{getLabel(_ps_labels, 'amountInWords')}</h4>
            <p className="inv-words-text">{amountInWords(totals.total)}</p>
            {dualCurrencyOn && (
              <p style={{ fontSize: '0.85em', color: '#555', fontStyle: 'italic', margin: '0.15rem 0 0' }}>
                Total: {fmt(totals.total)} · {fmtDualSecondary(totals.total)}
              </p>
            )}
          </>
        )}

        {qrDataUrl && (
          <div style={{ marginTop: '1.25rem' }}>
            <h4 className="inv-section-label">SCAN TO PAY (UPI)</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src={qrDataUrl}
                alt="UPI QR"
                style={{ width: '90px', height: '90px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
              />
              <div style={{ fontSize: '0.7rem', color: '#475569', lineHeight: 1.5 }}>
                <p style={{ margin: 0, color: '#475569' }}>UPI ID:</p>
                <p style={{ margin: 0, color: '#334155', fontWeight: 600, fontSize: '0.75rem' }}>{upiId}</p>
                <p style={{ margin: '0.25rem 0 0', color: '#475569' }}>{fmt(totals.total)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="inv-totals">
        {showSubtotal && (
          <div className="inv-total-row">
            <span>Subtotal</span>
            <span>{fmt(totals.subtotal)}</span>
          </div>
        )}

        {totals.totalDiscount > 0 && (
          <div className="inv-total-row" style={{ color: '#dc2626' }}>
            <span>Discount</span>
            <span>- {fmt(totals.totalDiscount)}</span>
          </div>
        )}

        {showGST && (
          isIndia && isInterstate ? (
            <div className="inv-total-row">
              <span>IGST</span>
              <span>{fmt(totals.igst)}</span>
            </div>
          ) : isIndia ? (
            <>
              <div className="inv-total-row">
                <span>CGST</span>
                <span>{fmt(totals.cgst)}</span>
              </div>
              <div className="inv-total-row">
                <span>SGST</span>
                <span>{fmt(totals.sgst)}</span>
              </div>
            </>
          ) : (
            <div className="inv-total-row">
              <span>{taxLabel}</span>
              <span>{fmt((totals.cgst || 0) + (totals.sgst || 0) + (totals.igst || 0))}</span>
            </div>
          )
        )}

        {totals.cess > 0 && (
          <div className="inv-total-row">
            <span>GST Cess</span>
            <span>{fmt(totals.cess)}</span>
          </div>
        )}

        {totals.tcsAmount > 0 && (
          <div className="inv-total-row">
            <span>TCS{options.tcsSection ? ` (${options.tcsSection} @ ${options.tcsRate}%)` : ''}</span>
            <span>{fmt(totals.tcsAmount)}</span>
          </div>
        )}

        {totals.invoiceDiscountAmount > 0 && (
          <div className="inv-total-row" style={{ color: '#dc2626' }}>
            <span>
              Discount on total
              {totals.invoiceDiscountType === 'percent' && totals.invoiceDiscountValue > 0
                ? ` (${totals.invoiceDiscountValue}%)`
                : ''}
            </span>
            <span>−{fmt(totals.invoiceDiscountAmount)}</span>
          </div>
        )}

        {totals.roundOff !== undefined && totals.roundOff !== 0 && (
          <div className="inv-total-row" style={{ color: '#64748b', fontStyle: 'italic' }}>
            <span>Round-off</span>
            <span>{totals.roundOff > 0 ? '+' : ''}{fmt(totals.roundOff)}</span>
          </div>
        )}

        {totalRowVariant === 'modern' ? (
          <div
            className="inv-total-row inv-total-final inv-total-modern"
            style={{ background: accent, color: '#fff', borderRadius: '6px', padding: '0.6rem 0.75rem', marginTop: '0.25rem' }}
          >
            <span style={{ color: '#fff' }}>{invoiceType === 'credit-note' ? 'Credit Amount' : 'Total Due'}</span>
            <span style={{ color: '#fff' }}>{fmt(totals.total)}</span>
          </div>
        ) : totalRowVariant === 'minimal' ? (
          <div
            className="inv-total-row inv-total-final"
            style={{ borderTop: `1.5px solid ${accent}`, background: 'transparent', padding: '0.5rem 0' }}
          >
            <span style={{ fontWeight: 700, color: '#0f172a' }}>
              {invoiceType === 'credit-note' ? 'Credit Amount' : 'Total Due'}
            </span>
            <span style={{ color: accent, fontWeight: 700 }}>{fmt(totals.total)}</span>
          </div>
        ) : (
          <div className="inv-total-row inv-total-final">
            <span>{invoiceType === 'credit-note' ? 'Credit Amount' : 'Total Due'}</span>
            <span style={{ color: accent }}>{fmt(totals.total)}</span>
          </div>
        )}

        {totals.tdsAmount > 0 && (
          <>
            <div
              className="inv-total-row"
              style={{
                color: '#64748b',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                borderTop: '1px dashed #e2e8f0',
                paddingTop: '0.4rem',
              }}
            >
              <span>Less: TDS{options.tdsSection ? ` (${options.tdsSection} @ ${options.tdsRate}%)` : ''}</span>
              <span>− {fmt(totals.tdsAmount)}</span>
            </div>
            <div className="inv-total-row" style={{ fontWeight: 600, color: '#0f766e', fontSize: '0.78rem' }}>
              <span>Net Receivable</span>
              <span>{fmt(totals.netReceivable)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
