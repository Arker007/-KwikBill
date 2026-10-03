import React from 'react';
import PrintSettings from '../../invoices/components/Print/PrintSettings';

interface PrintConfigTabProps {
  selectedSection?: string;
}

export const PrintConfigTab: React.FC<PrintConfigTabProps> = ({ selectedSection }) => {
  if (selectedSection && selectedSection !== 'section-print') {
    return null;
  }

  return (
    <div id="section-print" style={{ order: 4 }}>
      <PrintSettings />
    </div>
  );
};

