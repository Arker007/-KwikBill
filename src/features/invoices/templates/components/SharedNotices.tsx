import React from 'react';
import { InvoiceTemplateProps } from '../types';

export interface SharedNoticesProps {
  props: InvoiceTemplateProps;
  containerStyle?: React.CSSProperties;
}

export const SharedNotices: React.FC<SharedNoticesProps> = ({ props, containerStyle }) => {
  const { options = {}, isIndia, showGST, invoiceType } = props;

  return (
    <>
      {options.reverseCharge && isIndia && showGST && (
        <div
          style={{
            margin: '0 2rem 0.5rem',
            padding: '0.5rem 0.75rem',
            background: 'var(--warn-bg)',
            border: '1px solid var(--warn-border)',
            borderRadius: 4,
            fontSize: '0.78rem',
            color: 'var(--warn-text)',
            ...containerStyle,
          }}
        >
          <strong>Reverse Charge applicable.</strong> GST is payable by the recipient under Section 9(3)/9(4) of the CGST Act.
        </div>
      )}

      {invoiceType === 'composition' && (
        <div
          style={{
            margin: '0 2rem 0.5rem',
            padding: '0.5rem 0.75rem',
            background: 'var(--info-bg)',
            border: '1px solid var(--info-border)',
            borderRadius: 4,
            fontSize: '0.78rem',
            color: 'var(--info-text)',
            fontStyle: 'italic',
            ...containerStyle,
          }}
        >
          &quot;Composition taxable person, not eligible to collect tax on supplies.&quot;
          &nbsp;<span style={{ fontStyle: 'normal', fontSize: '0.7rem' }}>(Rule 46A, CGST Rules)</span>
        </div>
      )}
    </>
  );
};
