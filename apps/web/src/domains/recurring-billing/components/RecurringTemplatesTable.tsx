import React from 'react';
import { Play, Pause, Edit3, Trash2 } from 'lucide-react';
import { RecurringTemplate, FREQUENCIES } from '@/features/recurring';
import { StatusBadge } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';

export interface RecurringTemplatesTableProps {
  templates: RecurringTemplate[];
  toggleActive: (tpl: RecurringTemplate) => void;
  handleGenerateNow: (tpl: RecurringTemplate) => void;
  openEdit: (tpl: RecurringTemplate) => void;
  handleDelete: (id: string) => void;
}

export const RecurringTemplatesTable: React.FC<RecurringTemplatesTableProps> = ({
  templates,
  toggleActive,
  handleGenerateNow,
  openEdit,
  handleDelete,
}) => {
  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Frequency</th>
            <th>Items</th>
            <th>Est. Amount</th>
            <th>Next Invoice</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((tpl) => {
            const estTotal = (tpl.items || []).reduce((sum, i) => {
              const base = (Number(i.quantity) || 1) * (Number(i.rate) || 0) - (Number(i.discount) || 0);
              return sum + base + (base * (Number(i.taxPercent) || 0)) / 100;
            }, 0);
            const isUnassigned = !(tpl as any).ownerGstin;

            return (
              <tr
                key={tpl.id}
                style={
                  isUnassigned
                    ? { background: 'var(--warn-bg-subtle, rgba(245,158,11,0.06))' }
                    : undefined
                }
              >
                <td>
                  <strong>{tpl.clientName}</strong>
                  {tpl.clientGstin && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      GSTIN: {tpl.clientGstin}
                    </span>
                  )}
                </td>
                <td>
                  <span className="badge badge-info">
                    {FREQUENCIES.find((f) => f.value === tpl.frequency)?.label || tpl.frequency}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  {(tpl.items || [])
                    .map((i) => i.name || (i as any).description)
                    .filter(Boolean)
                    .join(', ') || '—'}
                </td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(estTotal)}</td>
                <td>
                  {tpl.nextDate
                    ? new Date(tpl.nextDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </td>
                <td>
                  <button
                    type="button"
                    className="focus:outline-none cursor-pointer bg-transparent border-none p-0"
                    onClick={() => toggleActive(tpl)}
                    title="Click to toggle status"
                  >
                    <StatusBadge
                      status={tpl.active !== false ? 'PAID' : 'DRAFT'}
                      label={tpl.active !== false ? 'Active' : 'Paused'}
                    />
                  </button>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex gap-1 justify-end" style={{ display: 'inline-flex' }}>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      onClick={() => handleGenerateNow(tpl)}
                      title="Generate invoice right now"
                    >
                      <Play size={13} /> Run
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => toggleActive(tpl)}
                      title={tpl.active !== false ? 'Pause' : 'Activate'}
                    >
                      {tpl.active !== false ? <Pause size={15} /> : <Play size={15} />}
                    </button>
                    <button className="icon-btn" onClick={() => openEdit(tpl)} title="Edit">
                      <Edit3 size={15} />
                    </button>
                    <button
                      className="icon-btn icon-btn-red"
                      onClick={() => tpl.id && handleDelete(tpl.id)}
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
