import React, { useState, useMemo } from 'react';
import { RefreshCw, Plus, Edit3, Trash2, Play, Pause, Calendar, Clock, IndianRupee, Layers } from 'lucide-react';
import { UnassignedBanner, AlertBanner } from '../shared/components/feedback';
import { StatCard, StatusBadge, Button } from '../shared/components/ui';
import { PageHeader } from '../shared/components/layout';
import { toast } from '../shared/components/feedback/Toast';
import { confirmAction } from '../shared/components/feedback/ConfirmModal';
import { formatCurrency } from '../shared/utils';
import {
  useRecurring,
  RecurringTemplate,
  FREQUENCIES,
  saveRecurringTemplate,
  deleteRecurringTemplate,
  toggleTemplateActiveState,
  generateBillFromTemplate,
  RecurringModal,
} from '../features/recurring';

export const RecurringPage: React.FC = () => {
  const {
    templates,
    clients,
    ownerProfile,
    unassignedTemplates,
    dueTemplates,
    assignUnassignedTemplates,
    reload,
  } = useRecurring();

  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RecurringTemplate | null>(null);

  const openAdd = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };

  const openEdit = (tpl: RecurringTemplate) => {
    setEditingTemplate(tpl);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTemplate(null);
  };

  const handleSaveTemplate = async (templateData: RecurringTemplate) => {
    try {
      await saveRecurringTemplate(templateData);
      toast(
        templateData.id ? 'Template updated' : 'Recurring invoice created',
        'success'
      );
      closeForm();
      reload();
    } catch {
      toast('Failed to save', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (
      await confirmAction({
        title: 'Delete this recurring invoice?',
        message:
          'The template will stop generating new invoices. Existing generated invoices stay in your dashboard untouched.',
        confirmLabel: 'Delete template',
        tone: 'danger',
      })
    ) {
      try {
        await deleteRecurringTemplate(id);
        toast('Deleted', 'success');
        reload();
      } catch {
        toast('Failed to delete', 'error');
      }
    }
  };

  const toggleActive = async (tpl: RecurringTemplate) => {
    try {
      await toggleTemplateActiveState(tpl);
      toast(tpl.active ? 'Paused' : 'Activated', 'info');
      reload();
    } catch {
      toast('Failed to toggle status', 'error');
    }
  };

  const handleGenerateNow = async (tpl: RecurringTemplate) => {
    try {
      const invoiceNumber = await generateBillFromTemplate(tpl);
      toast(`Invoice ${invoiceNumber} generated for ${tpl.clientName}`, 'success');
      reload();
    } catch (err: any) {
      toast('Failed to generate: ' + err.message, 'error');
    }
  };

  const activeCount = useMemo(() => {
    return templates.filter(t => t.active !== false).length;
  }, [templates]);

  const estMonthlyValue = useMemo(() => {
    return templates
      .filter(t => t.active !== false)
      .reduce((sum, tpl) => {
        const estTotal = (tpl.items || []).reduce((s, i) => {
          const base = (Number(i.quantity) || 1) * (Number(i.rate) || 0) - (Number(i.discount) || 0);
          return s + base + (base * (Number(i.taxPercent) || 0)) / 100;
        }, 0);
        const multiplier =
          tpl.frequency === 'weekly' ? 4.33 :
          tpl.frequency === 'quarterly' ? 0.33 :
          tpl.frequency === 'yearly' ? 0.083 : 1;
        return sum + (estTotal * multiplier);
      }, 0);
  }, [templates]);

  return (
    <div className="dashboard-container max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-5">
      <PageHeader
        breadcrumbs={[
          { label: 'Sales & Billing' },
          { label: 'Recurring Invoices' },
        ]}
        icon={<RefreshCw size={20} />}
        title="Recurring Invoices"
        subtitle="Automate periodic billing schedules for retainer and subscription clients"
        meta={`${templates.length} Schedules`}
      >
        <Button
          variant="primary"
          onClick={openAdd}
          id="btn-add-recurring-template"
          leftIcon={<Plus size={16} />}
        >
          Create Template
        </Button>
      </PageHeader>

      <UnassignedBanner
        count={unassignedTemplates.length}
        businessName={ownerProfile?.businessName}
        noun="recurring template"
        onAssign={assignUnassignedTemplates}
      />

      {/* Modern High-Density KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Schedules"
          value={`${activeCount} / ${templates.length}`}
          subtitle="Active billing subscriptions"
          icon={<Clock size={20} />}
          variant="success"
        />
        <StatCard
          title="Invoices Due Now"
          value={dueTemplates.length}
          subtitle="Ready for instant generation"
          icon={<Calendar size={20} />}
          variant={dueTemplates.length > 0 ? "warning" : "primary"}
        />
        <StatCard
          title="Est. Monthly Retainer"
          value={formatCurrency(estMonthlyValue)}
          subtitle="Normalized monthly recurring revenue"
          icon={<IndianRupee size={20} />}
          variant="purple"
        />
      </div>

      {dueTemplates.length > 0 && (
        <AlertBanner
          type="warning"
          icon={<Calendar size={18} />}
          title={`${dueTemplates.length} recurring invoice${dueTemplates.length > 1 ? 's are' : ' is'} due for generation`}
          description={
            <div className="flex gap-2 flex-wrap mt-2">
              {dueTemplates.map(tpl => (
                <button
                  key={tpl.id}
                  className="btn btn-primary text-xs py-1 px-2.5 flex items-center gap-1.5"
                  onClick={() => handleGenerateNow(tpl)}
                >
                  <Play size={12} /> {tpl.clientName} ({FREQUENCIES.find(f => f.value === tpl.frequency)?.label})
                </button>
              ))}
            </div>
          }
        />
      )}

      <RecurringModal
        isOpen={showForm}
        editingTemplate={editingTemplate}
        clients={clients}
        ownerProfile={ownerProfile}
        onClose={closeForm}
        onSave={handleSaveTemplate}
      />

      {/* Templates List */}
      <div className="bg-white dark:bg-[#141414] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] rounded-[8px] overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
        <div className="px-5 py-3.5 border-b border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#141414] dark:text-[#ffffff] m-0">
            Recurring Templates Register
          </h3>
          <span className="text-xs text-[#8c8c8c]">
            {templates.length} {templates.length === 1 ? 'template' : 'templates'}
          </span>
        </div>

        {templates.length === 0 ? (
          <div className="empty-state">
            <RefreshCw size={48} />
            <p>No recurring invoice templates created yet.</p>
            <p className="text-sm text-muted">
              Create a template for monthly retainers, subscriptions, or recurring services.
            </p>
            <button className="btn btn-primary mt-4" onClick={openAdd}>
              <Plus size={18} /> New Template
            </button>
          </div>
        ) : (
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
                {templates.map(tpl => {
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
                          {FREQUENCIES.find(f => f.value === tpl.frequency)?.label || tpl.frequency}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {(tpl.items || [])
                          .map(i => i.name || (i as any).description)
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
                        <div
                          className="flex gap-1 justify-end"
                          style={{ display: 'inline-flex' }}
                        >
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
                          <button
                            className="icon-btn"
                            onClick={() => openEdit(tpl)}
                            title="Edit"
                          >
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
        )}
      </div>
    </div>
  );
};

// Internal alias for modal inside file
import { RecurringModal as ImportRecurringModal } from '../features/recurring';

export default RecurringPage;
