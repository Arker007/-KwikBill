import React from 'react';
import { getCountryConfig } from '@/shared/utils';
import { getLabel } from '@/features/invoices/utils/printSettings';
import { InvoiceTemplateProps } from '../types';

export interface SharedPartiesProps {
  props: InvoiceTemplateProps;
  containerStyle?: React.CSSProperties;
  className?: string;
}

export const SharedParties: React.FC<SharedPartiesProps> = ({ props, containerStyle, className }) => {
  const {
    client,
    details,
    profile,
    showClientAddress,
    showClientEmail,
    showClientPhone,
    showState,
    showGSTIN,
    showPlaceOfSupply,
    showGST,
    isIndia,
    isInterstate,
    businessState,
    clientState,
    taxLabel,
    _ps_labels,
  } = props;

  const shipDifferent =
    details?.shipToSameAsBilling === false &&
    (details?.shippingAddress || details?.shippingCity || details?.shippingState);

  const clientDisplayName = (client?.name || 'Client Name').toUpperCase();
  const shipDisplayName = (details?.shippingName || client?.name || 'Client Name').toUpperCase();

  return (
    <div className={`inv-parties ${className || ''}`} style={containerStyle}>
      <div className="inv-party">
        <h4 className="inv-section-label">{getLabel(_ps_labels, 'billTo')}</h4>
        <p className="inv-party-name">{clientDisplayName}</p>
        <div className="inv-party-details">
          {showClientAddress && client?.address && <p>{client.address}</p>}
          {showClientAddress && (client?.city || client?.pin) && (
            <p>{[client.city, client.pin].filter(Boolean).join(' - ')}</p>
          )}
          {showState && client?.state && <p>{client.state}</p>}
          {showGSTIN && client?.gstin && (
            <p>
              {getCountryConfig(profile?.country).taxIdLabel}: <strong>{client.gstin}</strong>
            </p>
          )}
          {showClientEmail && client?.email && <p>{client.email}</p>}
          {showClientPhone && client?.phone && <p>Ph: {client.phone}</p>}
        </div>
      </div>

      {shipDifferent && (
        <div className="inv-party">
          <h4 className="inv-section-label">{getLabel(_ps_labels, 'shipTo')}</h4>
          <p className="inv-party-name">{shipDisplayName}</p>
          <div className="inv-party-details">
            {details.shippingAddress && <p>{details.shippingAddress}</p>}
            {(details.shippingCity || details.shippingPin) && (
              <p>{[details.shippingCity, details.shippingPin].filter(Boolean).join(' - ')}</p>
            )}
            {details.shippingState && <p>{details.shippingState}</p>}
          </div>
        </div>
      )}

      {showPlaceOfSupply && (
        <div className="inv-party inv-party-right">
          <h4 className="inv-section-label">{getLabel(_ps_labels, 'placeOfSupply')}</h4>
          <p className="inv-party-name">{details?.placeOfSupply || client?.state || '-'}</p>
          {showGST && isIndia && isInterstate && <span className="inv-tax-badge">Interstate (IGST)</span>}
          {showGST && isIndia && !isInterstate && businessState && clientState && (
            <span className="inv-tax-badge inv-tax-badge-green">Intrastate (CGST + SGST)</span>
          )}
          {showGST && !isIndia && <span className="inv-tax-badge inv-tax-badge-green">{taxLabel}</span>}
        </div>
      )}
    </div>
  );
};
