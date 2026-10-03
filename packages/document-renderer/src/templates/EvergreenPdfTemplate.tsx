import React from 'react';
import { InvoiceViewModel } from '../domain/createInvoiceViewModel';
import { ExactPdfTemplate } from './ExactPdfTemplate';

interface Props {
  vm: InvoiceViewModel;
  copyType?: string;
}

export const EvergreenPdfTemplate: React.FC<Props> = ({ vm, copyType }) => {
  return <ExactPdfTemplate vm={vm} copyType={copyType} />;
};

