import React from 'react';
import DOMPurify from 'dompurify';
import { htmlHasText, splitNumberedTerms, formatExchangeRateLine } from '@/shared/utils';
import { getLabel } from '@/features/invoices/utils/printSettings';
import { InvoiceTemplateProps } from '../types';

const ACCOUNT_TYPE_MAP: Record<string, string> = {
  savings: 'Savings',
  current: 'Current',
  cc: 'Cash Credit',
  od: 'Overdraft',
  nre: 'NRE',
  nro: 'NRO',
};

export interface SharedFooterProps {
  props: InvoiceTemplateProps;
  containerStyle?: React.CSSProperties;
  className?: string;
  bankBoxStyle?: React.CSSProperties;
}

export const SharedFooter: React.FC<SharedFooterProps> = ({
  props,
  containerStyle,
  className,
  bankBoxStyle,
}) => {
  const {
    profile,
    account,
    options = {},
    showBankDetails,
    showAccountLabel,
    showTerms,
    showNotes,
    showSignature,
    showSignatoryText,
    customTerms,
    customNotes,
    sellerCC,
    isIndia,
    termsClassMod,
    _ps,
    _ps_labels,
  } = props;

  const currencySymbol = options.currency || 'INR';

  return (
    <>
      <div className={`inv-footer ${className || ''}`} style={containerStyle}>
        <div className="inv-footer-left">
          {showBankDetails && (account?.bankName || profile?.bankName) && (
            <div className="inv-footer-block" style={bankBoxStyle}>
              <h4 className="inv-section-label">{getLabel(_ps_labels, 'bankDetails')}</h4>
              {showAccountLabel && account?.label && (
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                  Pay via: <strong style={{ color: '#334155' }}>{account.label}</strong>
                </p>
              )}
              <div className="inv-footer-details">
                {(account?.accountHolderName || profile?.businessName) && (
                  <p>
                    <span className="inv-detail-label">A/C Name:</span>{' '}
                    {account?.accountHolderName || profile.businessName}
                  </p>
                )}
                <p>
                  <span className="inv-detail-label">Bank:</span> {account?.bankName || profile.bankName}
                </p>
                <p>
                  <span className="inv-detail-label">A/C No:</span> {account?.accountNumber || profile.accountNumber}
                  {account?.accountType && (
                    <span style={{ marginLeft: '0.4rem', fontSize: '0.85em', color: '#64748b' }}>
                      · {ACCOUNT_TYPE_MAP[account.accountType] || account.accountType}
                    </span>
                  )}
                </p>
                {(account?.ifsc || profile.ifsc) && (
                  <p>
                    <span className="inv-detail-label">{sellerCC.bankLabel || 'IFSC'}:</span>{' '}
                    {account?.ifsc || profile.ifsc}
                  </p>
                )}
                {(account?.swift || profile.swift) && (
                  <p>
                    <span className="inv-detail-label">SWIFT/BIC:</span> {account?.swift || profile.swift}
                  </p>
                )}
                {profile.pan && isIndia && (
                  <p>
                    <span className="inv-detail-label">PAN:</span> {profile.pan}
                  </p>
                )}
              </div>
            </div>
          )}

          {options.exchangeRate && currencySymbol !== 'INR' && (
            <div className="inv-footer-block" style={bankBoxStyle}>
              <h4 className="inv-section-label">EXCHANGE RATE</h4>
              <p className="inv-terms">
                {formatExchangeRateLine(
                  currencySymbol,
                  options.exchangeRate,
                  profile?.country === 'India' || !profile?.country ? 'INR' : sellerCC.currency
                )}
              </p>
            </div>
          )}

          {!_ps.termsSeparatePage &&
            (() => {
              const termsHtml = customTerms ? splitNumberedTerms(DOMPurify.sanitize(customTerms)) : '';
              const hasTerms = htmlHasText(termsHtml);
              return showTerms && hasTerms ? (
                <div className="inv-footer-block" style={bankBoxStyle}>
                  <h4 className="inv-section-label">{getLabel(_ps_labels, 'terms')}</h4>
                  <div
                    className={`inv-terms inv-rich ${termsClassMod}`}
                    dangerouslySetInnerHTML={{ __html: termsHtml }}
                  />
                </div>
              ) : null;
            })()}

          {!_ps.termsSeparatePage &&
            (() => {
              const notesHtml = customNotes ? splitNumberedTerms(DOMPurify.sanitize(customNotes)) : '';
              const hasNotes = htmlHasText(notesHtml);
              return showNotes && hasNotes ? (
                <div className="inv-footer-block" style={bankBoxStyle}>
                  <h4 className="inv-section-label">{getLabel(_ps_labels, 'notes')}</h4>
                  <div
                    className={`inv-terms inv-rich ${termsClassMod}`}
                    dangerouslySetInnerHTML={{ __html: notesHtml }}
                  />
                </div>
              ) : null;
            })()}
        </div>

        {(() => {
          const printCfg = _ps;
          const sigImg = profile?.signature || (printCfg.signatureShow !== false ? printCfg.signatureImage : null);
          const sigName = (profile?.businessName || profile?.companyName || printCfg.signatureName || '').toUpperCase();
          if (!showSignature || !sigImg) return null;
          return (
            <div className="inv-signature">
              {showSignatoryText && <p className="inv-sig-label">Authorized Signatory</p>}
              <img
                src={sigImg}
                alt="Signature"
                style={{
                  maxHeight: '60px',
                  maxWidth: '180px',
                  objectFit: 'contain',
                  display: 'block',
                  marginLeft: 'auto',
                  marginBottom: '0.4rem',
                }}
              />
              <p className="inv-sig-name">{sigName}</p>
            </div>
          );
        })()}
      </div>

      {_ps.termsSeparatePage && (customTerms || customNotes) && (
        <div data-pdf-page="terms" style={{ padding: '2rem', pageBreakBefore: 'always', breakBefore: 'page' }}>
          {(() => {
            const termsHtml = customTerms ? splitNumberedTerms(DOMPurify.sanitize(customTerms)) : '';
            const hasTerms = htmlHasText(termsHtml);
            return showTerms && hasTerms ? (
              <div className="inv-footer-block" style={bankBoxStyle}>
                <h4 className="inv-section-label">{getLabel(_ps_labels, 'terms')}</h4>
                <div
                  className={`inv-terms inv-rich ${termsClassMod}`}
                  dangerouslySetInnerHTML={{ __html: termsHtml }}
                />
              </div>
            ) : null;
          })()}
          {(() => {
            const notesHtml = customNotes ? splitNumberedTerms(DOMPurify.sanitize(customNotes)) : '';
            const hasNotes = htmlHasText(notesHtml);
            return showNotes && hasNotes ? (
              <div className="inv-footer-block" style={{ marginTop: '2rem', ...bankBoxStyle }}>
                <h4 className="inv-section-label">{getLabel(_ps_labels, 'notes')}</h4>
                <div
                  className={`inv-terms inv-rich ${termsClassMod}`}
                  dangerouslySetInnerHTML={{ __html: notesHtml }}
                />
              </div>
            ) : null;
          })()}
        </div>
      )}
    </>
  );
};
