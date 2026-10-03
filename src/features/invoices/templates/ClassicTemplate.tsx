import React from 'react';
import { InvoiceHeaderProps, InvoiceTemplateProps } from './types';
import { ExactInvoiceLayout } from './ExactInvoiceLayout';

export const ClassicHeader: React.FC<InvoiceHeaderProps> = (props) => {
  // Re-export compatible header facade
  return null;
};

export const ClassicTemplate: React.FC<InvoiceTemplateProps> = (props) => {
  return <ExactInvoiceLayout {...props} />;
};

export default ClassicTemplate;
