import React from 'react';
import { Document } from '@react-pdf/renderer';
import { createInvoiceViewModel, InvoiceViewModel } from './domain/createInvoiceViewModel';
import { getInvoiceTemplate } from './templates/templateRegistry';
import { registerInvoiceFonts } from './fonts/registerInvoiceFonts';

export interface InvoiceDocumentProps {
  invoiceData?: {
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
  };
  viewModel?: InvoiceViewModel;
  templateKey?: string;
  copyType?: string;
  printSettings?: any;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoiceData,
  viewModel,
  templateKey,
  copyType,
  printSettings,
}) => {
  registerInvoiceFonts();

  const vm = viewModel || createInvoiceViewModel(invoiceData || {}, printSettings);
  const activeTemplateKey = templateKey || vm.options?.pdfStyle || vm.printSettings?.pdfTemplate || 'classic';
  const TemplateComp = getInvoiceTemplate(activeTemplateKey, vm.isThermal);

  const ps = vm.printSettings || {};
  const isTaxableInvoice = ['tax-invoice', 'bill-of-supply', 'composition', 'credit-note', 'delivery-challan'].includes(vm.invoiceType);
  const isMultiCopy = !vm.isThermal && isTaxableInvoice && ps.multiCopyEnabled && Number(ps.multiCopyCount) > 1;

  if (isMultiCopy) {
    const copyLabels = [
      'ORIGINAL FOR RECIPIENT',
      'DUPLICATE FOR TRANSPORTER',
      'TRIPLICATE FOR SUPPLIER',
      'EXTRA COPY',
    ];
    const copies = Array.from({ length: Math.min(4, Number(ps.multiCopyCount) || 2) });

    return (
      <Document title={`Invoice_${vm.invoiceNumber}`} author={vm.profile?.businessName || 'Free GST Billing'}>
        {copies.map((_, idx) => (
          <TemplateComp key={idx} vm={vm} copyType={copyLabels[idx] || `COPY #${idx + 1}`} />
        ))}
      </Document>
    );
  }

  return (
    <Document title={`Invoice_${vm.invoiceNumber}`} author={vm.profile?.businessName || 'Free GST Billing'}>
      <TemplateComp vm={vm} copyType={copyType} />
    </Document>
  );
};
