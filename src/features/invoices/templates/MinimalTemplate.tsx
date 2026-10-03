import React from 'react';
import { InvoiceHeaderProps, InvoiceTemplateProps } from './types';
import { SharedParties } from './components/SharedParties';
import { SharedItemsTable } from './components/SharedItemsTable';
import { SharedTotals } from './components/SharedTotals';
import { SharedFooter } from './components/SharedFooter';
import { SharedNotices } from './components/SharedNotices';
import { SharedExtraSections } from './components/SharedExtraSections';
import { SharedWatermark } from './components/SharedWatermark';

export const MinimalHeader: React.FC<InvoiceHeaderProps> = ({
  profile,
  details,
  invoiceType,
  options = {},
  accent,
  customTitle,
  sellerCC,
  showLogo,
  showInvoiceNumber,
  showInvoiceDate,
  showDueDate,
  showReverseChargeLine,
  reverseChargeText,
  showBusinessName,
  showBusinessAddress,
  showState,
  showGSTIN,
  showBusinessEmail,
  showBusinessPhone,
}) => {
  return (
    <>
      <div style={{ padding: '2rem 2rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            {showLogo && (options?.logo || profile?.logo) && (
              <img
                src={options?.logo || profile?.logo}
                alt="Logo"
                style={{
                  maxHeight: `${options?.logoHeight || profile?.logoHeight || 48}px`,
                  maxWidth: '180px',
                  objectFit: 'contain',
                  marginBottom: '0.5rem',
                  display: 'block',
                }}
              />
            )}
            {showBusinessName && (
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                {(profile?.businessName || profile?.companyName || 'Your Business').toUpperCase()}
              </h2>
            )}
            <div style={{ fontSize: '0.7rem', color: '#475569', lineHeight: 1.6, marginTop: '0.25rem' }}>
              {showBusinessAddress && profile?.address && <p style={{ margin: 0 }}>{profile.address}</p>}
              {showBusinessAddress && (profile?.city || profile?.pin) && (
                <p style={{ margin: 0 }}>{[profile.city, profile.pin].filter(Boolean).join(' - ')}</p>
              )}
              {showState && profile?.state && <p style={{ margin: 0 }}>{profile.state}</p>}
              {showGSTIN && profile?.gstin && (
                <p style={{ margin: 0 }}>
                  {sellerCC?.taxIdLabel || 'GSTIN'}: {profile.gstin}
                </p>
              )}
              {showBusinessEmail && profile?.email && <p style={{ margin: 0 }}>{profile.email}</p>}
              {showBusinessPhone && profile?.phone && <p>Ph: {profile.phone}</p>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: accent, margin: '0 0 0.5rem', letterSpacing: '0.05em' }}>
              {customTitle}
            </h1>
            <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.8 }}>
              {showInvoiceNumber && <p style={{ margin: 0 }}>{details?.invoiceNumber}</p>}
              {showInvoiceDate && (
                <p style={{ margin: 0 }}>
                  {details?.invoiceDate
                    ? new Date(details.invoiceDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : ''}
                </p>
              )}
              {showDueDate && details?.dueDate && (
                <p style={{ margin: 0 }}>
                  Due:{' '}
                  {new Date(details.dueDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
              {showReverseChargeLine && <p style={{ margin: 0 }}>Reverse Charge: {reverseChargeText}</p>}
            </div>
          </div>
        </div>
        {invoiceType === 'proforma' && (
          <p style={{ fontSize: '0.7rem', color: '#475569', fontStyle: 'italic', margin: '0 0 0.5rem' }}>
            This is not a tax invoice. For estimation purposes only.
          </p>
        )}
        <div style={{ borderBottom: `1.5px solid ${accent}`, marginBottom: '0' }} />
      </div>
      <style>
        {`
          .template-minimal .inv-th {
            background: transparent;
            color: #111;
            border-bottom: 1.5px solid #111;
            border-top: 1.5px solid #111;
            font-weight: 700;
          }
          .template-minimal .inv-parties {
            border: none;
            padding: 0 2rem 1rem;
          }
          .template-minimal .inv-section-label {
            color: #111;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.75rem;
          }
        `}
      </style>
    </>
  );
};

export const MinimalTemplate: React.FC<InvoiceTemplateProps> = (props) => {
  const {
    profile,
    client,
    details,
    invoiceType,
    options,
    accent,
    customTitle,
    sellerCC,
    isIndia,
    taxLabel,
    showGST,
    showState,
    showGSTIN,
    showPlaceOfSupply,
    showBusinessName,
    showBusinessAddress,
    showBusinessPhone,
    showBusinessEmail,
    showInvoiceNumber,
    showInvoiceDate,
    showDueDate,
    showReverseChargeLine,
    reverseChargeText,
    showLogo,
    hideHeaderBecauseLetterhead,
  } = props;

  return (
    <div className="invoice-structure invoice-structure-minimal">
      {!hideHeaderBecauseLetterhead && (
        <MinimalHeader
          profile={profile}
          client={client}
          details={details}
          invoiceType={invoiceType || 'tax-invoice'}
          options={options}
          accent={accent}
          customTitle={customTitle}
          sellerCC={sellerCC}
          isIndia={isIndia}
          taxLabel={taxLabel}
          showGST={showGST}
          showState={showState}
          showGSTIN={showGSTIN}
          showPlaceOfSupply={showPlaceOfSupply}
          showBusinessName={showBusinessName}
          showBusinessAddress={showBusinessAddress}
          showBusinessPhone={showBusinessPhone}
          showBusinessEmail={showBusinessEmail}
          showInvoiceNumber={showInvoiceNumber}
          showInvoiceDate={showInvoiceDate}
          showDueDate={showDueDate}
          showReverseChargeLine={showReverseChargeLine}
          reverseChargeText={reverseChargeText}
          showLogo={showLogo}
        />
      )}

      <SharedParties
        props={props}
        containerStyle={{ padding: '0 2rem 1rem', border: 'none', background: 'transparent' }}
      />

      <SharedItemsTable
        props={props}
        tableStyle={{ margin: '0 2rem', width: 'calc(100% - 4rem)', borderTop: 'none' }}
      />

      <SharedTotals
        props={props}
        containerStyle={{ padding: '1rem 2rem' }}
        totalRowVariant="minimal"
      />

      <SharedNotices props={props} />

      <SharedFooter
        props={props}
        containerStyle={{ padding: '1rem 2rem', borderTop: '1px solid #cbd5e1' }}
        bankBoxStyle={{ background: 'transparent', border: 'none', padding: '0.3rem 0' }}
      />

      <SharedExtraSections props={props} />

      <SharedWatermark props={props} />
    </div>
  );
};

export default MinimalTemplate;
