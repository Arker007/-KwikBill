import React from 'react';
import DOMPurify from 'dompurify';
import { InvoiceTemplateProps, ExtraSection } from '../types';

export interface SharedExtraSectionsProps {
  props: InvoiceTemplateProps;
}

export const SharedExtraSections: React.FC<SharedExtraSectionsProps> = ({ props }) => {
  const { extraSections = [], customTitle, details, client } = props;
  const filtered = extraSections.filter((s: ExtraSection) => s.title || s.content);
  if (filtered.length === 0) return null;

  const totalPages = 1 + filtered.length;

  return (
    <>
      {filtered.map((section: ExtraSection, idx: number) => (
        <div key={section.id || `extra-section-page-${idx}`} className="inv-extra-page" data-pdf-page={idx + 2}>
          <div className="inv-extra-page-header">
            <div>
              <span className="inv-extra-ref">
                {customTitle} — {details?.invoiceNumber}
              </span>
              {client?.name && <span className="inv-extra-ref"> | {client.name}</span>}
            </div>
            <span className="inv-extra-page-num">
              Page {idx + 2} of {totalPages}
            </span>
          </div>
          {section.title && (
            <h4 className="inv-section-label" style={{ marginBottom: '0.75rem' }}>
              {section.title.toUpperCase()}
            </h4>
          )}
          {section.content && (
            <div
              className="inv-extra-content"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
            />
          )}
        </div>
      ))}
    </>
  );
};
