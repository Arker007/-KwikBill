import React from 'react';
import { Page, View } from '@react-pdf/renderer';
import { InvoiceViewModel } from '../domain/createInvoiceViewModel';
import { createInvoiceStyles } from '../styles/invoiceSharedStyles';
import { InvoiceHeader } from '../components/InvoiceHeader';
import { InvoiceParties } from '../components/InvoiceParties';
import { InvoiceItemsTable } from '../components/InvoiceItemsTable';
import { InvoiceTotals } from '../components/InvoiceTotals';
import { InvoiceTerms } from '../components/InvoiceTerms';
import { InvoiceFooter } from '../components/InvoiceFooter';
import { InvoiceWatermark } from '../components/InvoiceWatermark';
import { InvoiceCopyLabel } from '../components/InvoiceCopyLabel';

interface Props {
  vm: InvoiceViewModel;
  copyType?: string;
}

export const ClassicPdfTemplate: React.FC<Props> = ({ vm, copyType }) => {
  const styles = createInvoiceStyles(vm.accentColor);

  return (
    <Page size="A4" style={styles.page}>
      <InvoiceWatermark vm={vm} styles={styles} />
      <InvoiceCopyLabel copyType={copyType} styles={styles} />
      <InvoiceHeader vm={vm} styles={styles} />
      <InvoiceParties vm={vm} styles={styles} />
      <InvoiceItemsTable vm={vm} styles={styles} />
      <InvoiceTotals vm={vm} styles={styles} />
      <InvoiceTerms vm={vm} styles={styles} />
      <InvoiceFooter vm={vm} styles={styles} />
    </Page>
  );
};
