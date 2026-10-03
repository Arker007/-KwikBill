/**
 * Delegating facade for PDF build and download services.
 * Ports implementation to @free-gst/document-renderer using @react-pdf/renderer.
 */

export {
  collectDocumentStyles,
  legacyBuildInvoicePDF as buildInvoicePDF,
  downloadInvoicePDF,
  createInvoicePDFBlob,
  createInvoicePDFUrl,
  printInvoicePDF,
  InvoiceDocument,
  createInvoiceViewModel,
  registerInvoiceFonts,
} from '@free-gst/document-renderer';

export type { PDFBuildOptions, InvoicePdfOptions } from '@free-gst/document-renderer';
