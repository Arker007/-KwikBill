import React from 'react';
import { Printer, Pencil, Trash2 } from 'lucide-react';
import { Receipt } from '@/features/receipts/types';
import { formatCurrency } from '@/shared/utils';

export interface PaymentsTableProps {
  receipts: Receipt[];
  onPrint: (r: Receipt) => void;
  onEdit: (r: Receipt) => void;
  onDelete: (id: string) => void;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
  receipts,
  onPrint,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="table-scroll">
      <table className="data-table" style={{ minWidth: '700px' }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Receipt No</th>
            <th>Client</th>
            <th>Against Invoice</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th>Mode</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((rcp) => (
            <tr key={rcp.id}>
              <td>{rcp.date}</td>
              <td style={{ fontWeight: 600 }}>{rcp.receiptNo}</td>
              <td>{rcp.clientName}</td>
              <td>{rcp.againstInvoice || '—'}</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>
                {formatCurrency(Number(rcp.amount) || 0)}
              </td>
              <td>{rcp.paymentMode || 'Cash'}</td>
              <td>
                <div className="flex gap-1">
                  <button
                    className="icon-btn"
                    onClick={() => onPrint(rcp)}
                    title="Print Receipt"
                  >
                    <Printer size={15} />
                  </button>
                  <button className="icon-btn" onClick={() => onEdit(rcp)} title="Edit">
                    <Pencil size={15} />
                  </button>
                  <button
                    className="icon-btn icon-btn-red"
                    onClick={() => rcp.id && onDelete(rcp.id)}
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
