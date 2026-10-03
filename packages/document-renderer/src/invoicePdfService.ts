import React from 'react';
import { pdf } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import { InvoiceDocument, InvoiceDocumentProps } from './InvoiceDocument';
import { registerInvoiceFonts } from './fonts/registerInvoiceFonts';

export interface InvoicePdfOptions extends InvoiceDocumentProps {
  fileName?: string;
}

export async function createInvoicePDFBlob(options: InvoicePdfOptions): Promise<Blob> {
  registerInvoiceFonts();
  const doc = React.createElement(InvoiceDocument, options);
  return await pdf(doc as React.ReactElement<DocumentProps>).toBlob();
}

export async function createInvoicePDFUrl(options: InvoicePdfOptions): Promise<string> {
  const blob = await createInvoicePDFBlob(options);
  return URL.createObjectURL(blob);
}

export async function downloadInvoicePDF(options: InvoicePdfOptions): Promise<void> {
  const blob = await createInvoicePDFBlob(options);
  const url = URL.createObjectURL(blob);
  const fileName = options.fileName || `Invoice_${options.invoiceData?.details?.invoiceNumber || 'document'}.pdf`;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function printInvoicePDF(options: InvoicePdfOptions): Promise<void> {
  const blob = await createInvoicePDFBlob(options);
  const url = URL.createObjectURL(blob);

  // Securely bypass iframe sandbox blocks (e.g., inside AI Studio frames) by directly opening in a new window/tab
  if (typeof window !== 'undefined' && window.self !== window.top) {
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }

  let frame = document.getElementById('fgsb-print-frame') as HTMLIFrameElement | null;
  if (!frame) {
    frame = document.createElement('iframe');
    frame.id = 'fgsb-print-frame';
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    document.body.appendChild(frame);
  }

  frame.onload = () => {
    try {
      frame?.contentWindow?.focus();
      frame?.contentWindow?.print();
    } catch {
      window.open(url, '_blank');
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  frame.src = url;
}
