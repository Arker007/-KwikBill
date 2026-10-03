import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { Expense } from '@/features/expenses/types';
import { CATEGORY_NAMES } from '@/features/expenses/services/expenseService';
import { formatCurrency } from '@/shared/utils';

export interface ExpensesTableProps {
  expenses: Expense[];
  onEdit: (exp: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpensesTable: React.FC<ExpensesTableProps> = ({
  expenses,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Vendor</th>
            <th>GST / ITC</th>
            <th>Amount</th>
            <th>Mode</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => {
            const isUnassigned = !(exp as any).ownerGstin;

            return (
              <tr
                key={exp.id}
                style={
                  isUnassigned
                    ? { background: 'var(--warn-bg-subtle, rgba(245,158,11,0.06))' }
                    : undefined
                }
              >
                <td>{exp.date}</td>
                <td>
                  <span className="badge badge-info">
                    {CATEGORY_NAMES[exp.category] || exp.category}
                  </span>
                </td>
                <td>
                  <strong>{exp.description}</strong>
                  {exp.note && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {exp.note}
                    </span>
                  )}
                </td>
                <td>
                  {exp.vendorName ? (
                    <>
                      {exp.vendorName}
                      {exp.vendorGstin && (
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {exp.vendorGstin}
                        </span>
                      )}
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
                <td>
                  {exp.gstAmount ? (
                    <span style={{ color: 'var(--success-color, #10b981)', fontWeight: 500 }}>
                      {formatCurrency(exp.gstAmount)} ({exp.gstPercent}%)
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(exp.amount)}</td>
                <td>{exp.paymentMode || '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex gap-1 justify-end" style={{ display: 'inline-flex' }}>
                    <button className="icon-btn" onClick={() => onEdit(exp)} title="Edit">
                      <Edit3 size={15} />
                    </button>
                    <button
                      className="icon-btn icon-btn-red"
                      onClick={() => exp.id && onDelete(exp.id)}
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
