import React from 'react';
import { InvoiceHeaderProps, InvoiceTemplateProps } from './types';
import { ExactInvoiceLayout } from './ExactInvoiceLayout';

export const EvergreenHeader: React.FC<InvoiceHeaderProps> = (props) => {
  return null;
};

export const EvergreenTemplate: React.FC<InvoiceTemplateProps> = (props) => {
  return <ExactInvoiceLayout {...props} />;
};

export default EvergreenTemplate;
