import React from 'react';
import { InvoiceHeaderProps, InvoiceTemplateProps } from './types';
import { ClassicTemplate, ClassicHeader } from './ClassicTemplate';
import { ModernTemplate, ModernHeader } from './ModernTemplate';
import { MinimalTemplate, MinimalHeader } from './MinimalTemplate';
import { EvergreenTemplate, EvergreenHeader } from './EvergreenTemplate';
import { ExactInvoiceLayout } from './ExactInvoiceLayout';

export * from './types';
export * from './ExactInvoiceLayout';
export * from './ClassicTemplate';
export * from './ModernTemplate';
export * from './MinimalTemplate';
export * from './EvergreenTemplate';

export const headerRegistry: Record<string, React.FC<InvoiceHeaderProps>> = {
  classic: ClassicHeader,
  modern: ModernHeader,
  minimal: MinimalHeader,
  evergreen: EvergreenHeader,
  exact: ClassicHeader,
};

export const templateRegistry: Record<string, React.FC<InvoiceTemplateProps>> = {
  classic: ExactInvoiceLayout,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  evergreen: EvergreenTemplate,
  exact: ExactInvoiceLayout,
  'exact-invoice-layout': ExactInvoiceLayout,
  exactpdftemplate: ExactInvoiceLayout,
};
