import React from 'react';
import { InvoiceHeaderProps, InvoiceTemplateProps } from './types';
import { SharedParties } from './components/SharedParties';
import { SharedItemsTable } from './components/SharedItemsTable';
import { SharedTotals } from './components/SharedTotals';
import { SharedFooter } from './components/SharedFooter';
import { SharedNotices } from './components/SharedNotices';
import { SharedExtraSections } from './components/SharedExtraSections';
import { SharedWatermark } from './components/SharedWatermark';

export const ModernHeader: React.FC<InvoiceHeaderProps> = ({
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
      <div
        style={{
          background: accent,
          padding: '1.5rem 2rem',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
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
                filter: 'brightness(0) invert(1)',
              }}
            />
          )}
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '0.08em' }}>
            {customTitle}
          </h1>
          {invoiceType === 'proforma' && (
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', margin: '0.25rem 0 0' }}>
              For estimation purposes only
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          {showBusinessName && (
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
              {(profile?.businessName || profile?.companyName || 'Your Business').toUpperCase()}
            </h2>
          )}
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
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
            {showBusinessPhone && profile?.phone && <p style={{ margin: 0 }}>Ph: {profile.phone}</p>}
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0.75rem 2rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem' }}>
          {showInvoiceNumber && (
            <span>
              <strong style={{ color: '#64748b' }}>No.</strong> {details?.invoiceNumber}
            </span>
          )}
          {showInvoiceDate && (
            <span>
              <strong style={{ color: '#64748b' }}>Date</strong>{' '}
              {details?.invoiceDate
                ? new Date(details.invoiceDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : ''}
            </span>
          )}
          {showDueDate && details?.dueDate && (
            <span>
              <strong style={{ color: '#64748b' }}>Due</strong>{' '}
              {new Date(details.dueDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
          {showReverseChargeLine && (
            <span>
              <strong style={{ color: '#64748b' }}>Reverse Charge</strong> {reverseChargeText}
            </span>
          )}
        </div>
        {invoiceType === 'credit-note' && details?.originalInvoiceRef && (
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Against: <strong style={{ color: '#334155' }}>{details.originalInvoiceRef}</strong>
          </span>
        )}
      </div>
      <style>
        {`
          .template-modern .inv-th {
            background-color: ${accent};
            color: #ffffff;
            border-bottom: none;
            font-weight: 700;
          }
          .template-modern .inv-parties {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }
          .template-modern .inv-section-label {
            color: ${accent};
            font-weight: 800;
            text-transform: uppercase;
            font-size: 0.75rem;
          }
        `}
      </style>
    </>
  );
};

export const ModernTemplate: React.FC<InvoiceTemplateProps> = (props) => {
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
    <div
      className="invoice-structure invoice-structure-modern"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}
    >
      {!hideHeaderBecauseLetterhead && (
        <ModernHeader
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

      <SharedParties props={props} containerStyle={{ padding: '1rem 2rem' }} />

      <SharedItemsTable
        props={props}
        tableStyle={{ margin: '0 2rem', width: 'calc(100% - 4rem)' }}
      />

      <SharedTotals
        props={props}
        containerStyle={{ padding: '1rem 2rem' }}
        totalRowVariant="modern"
      />

      <SharedNotices props={props} />

      <SharedFooter
        props={props}
        containerStyle={{ padding: '1rem 2rem' }}
        bankBoxStyle={{ background: '#f8fafc', borderRadius: '8px' }}
      />

      <SharedExtraSections props={props} />

      <SharedWatermark props={props} />

      {/* Bottom accent bar for modern style */}
      <div style={{ height: '4px', background: accent, marginTop: 'auto' }} />
    </div>
  );
};

export default ModernTemplate;
