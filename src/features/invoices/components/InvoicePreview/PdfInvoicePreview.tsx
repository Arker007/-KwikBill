import React, { useMemo } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { InvoiceDocument } from '@free-gst/document-renderer';

export interface PdfInvoicePreviewProps {
  profile?: any;
  client?: any;
  details?: any;
  items?: any[];
  totals?: any;
  invoiceType?: string;
  customTerms?: string;
  customNotes?: string;
  extraSections?: any[];
  options?: any;
  style?: React.CSSProperties;
}

export const PdfInvoicePreview: React.FC<PdfInvoicePreviewProps> = ({
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
  style,
}) => {
  const invoiceData = useMemo(
    () => ({
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
    }),
    [profile, client, details, items, totals, invoiceType, customTerms, customNotes, extraSections, options]
  );

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px', ...style }}>
      <PDFViewer style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}>
        <InvoiceDocument invoiceData={invoiceData} />
      </PDFViewer>
    </div>
  );
};

export default PdfInvoicePreview;
