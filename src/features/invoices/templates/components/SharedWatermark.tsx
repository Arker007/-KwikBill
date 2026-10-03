import React from 'react';
import { InvoiceTemplateProps } from '../types';

export interface SharedWatermarkProps {
  props: InvoiceTemplateProps;
}

export const SharedWatermark: React.FC<SharedWatermarkProps> = ({ props }) => {
  const { invoiceType, accent } = props;

  if (invoiceType !== 'proforma') return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-35deg)',
        fontSize: '5rem',
        fontWeight: 800,
        color: `${accent}0a`,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      ESTIMATE
    </div>
  );
};
