import React from 'react';
import { InvoiceViewModel } from '../domain/createInvoiceViewModel';
import { ClassicPdfTemplate } from './ClassicPdfTemplate';
import { ModernPdfTemplate } from './ModernPdfTemplate';
import { MinimalPdfTemplate } from './MinimalPdfTemplate';
import { EvergreenPdfTemplate } from './EvergreenPdfTemplate';
import { ThermalPdfTemplate } from './ThermalPdfTemplate';
import { ExactPdfTemplate } from './ExactPdfTemplate';

export type PdfTemplateComponent = React.FC<{ vm: InvoiceViewModel; copyType?: string }>;

export const templateRegistry: Record<string, PdfTemplateComponent> = {
  classic: ExactPdfTemplate,
  modern: ModernPdfTemplate,
  minimal: MinimalPdfTemplate,
  evergreen: EvergreenPdfTemplate,
  exact: ExactPdfTemplate,
  'exact-invoice-layout': ExactPdfTemplate,
  exactpdftemplate: ExactPdfTemplate,
  thermal: ThermalPdfTemplate as unknown as PdfTemplateComponent,
};

export function getInvoiceTemplate(templateKey?: string, isThermal?: boolean): PdfTemplateComponent {
  if (isThermal) return ThermalPdfTemplate as unknown as PdfTemplateComponent;
  if (!templateKey) return ExactPdfTemplate;
  const key = templateKey.toLowerCase();
  return templateRegistry[key] || ExactPdfTemplate;
}
