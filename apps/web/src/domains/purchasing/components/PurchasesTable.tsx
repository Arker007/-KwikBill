import React from 'react';
import { Download, Eye, Edit3, Trash2 } from 'lucide-react';
import { Purchase, calcPurchaseTotal, generatePurchasePdf } from '@/features/purchases';
import { StatusBadge } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';

export interface PurchasesTableProps {
  purchases: Purchase[];
  onView: (p: Purchase) => void;
  onEdit: (p: Purchase) => void;
  onDelete: (id: string) => void;
}

export const PurchasesTable: React.FC<PurchasesTableProps> = ({
  purchases,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Supplier</th>
            <th>Invoice No</th>
            <th>Taxable</th>
            <th>Tax</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => {
            const totals = calcPurchaseTotal(p.items, !!p.applyRoundOff);
            const isUnassigned = !(p as any).ownerGstin;

            return (
              <tr
                key={p.id || p.invoiceNumber}
                style={
                  isUnassigned
                    ? { background: 'var(--warn-bg-subtle, rgba(245,158,11,0.06))' }
                    : undefined
                }
              >
                <td>{p.date}</td>
                <td>
                  <strong>{p.supplierName}</strong>
                  {p.supplierGstin && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      GSTIN: {p.supplierGstin}
                    </span>
                  )}
                </td>
                <td style={{ fontFamily: 'monospace' }}>{p.invoiceNumber}</td>
                <td>{formatCurrency(totals.taxable)}</td>
                <td>{formatCurrency(totals.tax)}</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(totals.finalTotal)}</td>
                <td>
                  <StatusBadge
                    status={p.paymentStatus === 'Paid' ? 'PAID' : 'DRAFT'}
                    label={p.paymentStatus}
                  />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex gap-1 justify-end" style={{ display: 'inline-flex' }}>
                    <button
                      className="icon-btn"
                      onClick={() => onView(p)}
                      title="View Bill Details"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => generatePurchasePdf(p)}
                      title="Download Voucher PDF"
                    >
                      <Download size={15} />
                    </button>
                    <button className="icon-btn" onClick={() => onEdit(p)} title="Edit">
                      <Edit3 size={15} />
                    </button>
                    <button
                      className="icon-btn icon-btn-red"
                      onClick={() => p.id && onDelete(p.id)}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
