import React from 'react';
import { formatCurrency } from '@/shared/utils';

export interface UnpaidBill {
  id: string;
  invoiceNumber: string;
  clientName: string;
  totalAmount: number;
  paidAmount?: number;
}

export interface BillAllocationTableProps {
  unpaidBills: UnpaidBill[];
  selectedInvoiceNumber?: string;
  onSelectBill: (bill: UnpaidBill) => void;
}

export const BillAllocationTable: React.FC<BillAllocationTableProps> = ({
  unpaidBills,
  selectedInvoiceNumber,
  onSelectBill,
}) => {
  return (
    <div className="client-picker" style={{ maxHeight: '200px', overflowY: 'auto' }}>
      {unpaidBills.map((bill) => {
        const balance = bill.totalAmount - (bill.paidAmount || 0);
        const isSelected = selectedInvoiceNumber === bill.invoiceNumber;

        return (
          <button
            key={bill.id}
            className={`client-picker-item ${isSelected ? 'active' : ''}`}
            onClick={() => onSelectBill(bill)}
          >
            <div>
              <strong>{bill.clientName}</strong>
              <span
                style={{
                  marginLeft: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                {bill.invoiceNumber}
              </span>
            </div>
            {balance > 0.005 && (
              <span style={{ fontWeight: 600 }}>{formatCurrency(balance)}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
