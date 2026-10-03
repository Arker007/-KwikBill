import React from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Textarea } from '@/shared/components/ui';
import { saveTermsTemplate, deleteTermsTemplate } from '@/store';
import { toast } from '@/shared/components/feedback/Toast';
import { confirmAction } from '@/shared/components/feedback/ConfirmModal';

export interface TermsTemplate {
  id: string;
  name: string;
  content: string;
}

const QUICK_START_TEMPLATES = [
  {
    name: 'Standard Retail T&C',
    content: '1. Goods once sold will not be taken back.\n2. Interest @ 18% per annum will be charged if payment is not made within 15 days.\n3. All disputes are subject to local jurisdiction.',
  },
  {
    name: 'Wholesale B2B Terms',
    content: '1. Please check the goods upon delivery. No claims will be entertained after 48 hours.\n2. Payment terms: Net 30 days from invoice date.\n3. Goods remain the property of the seller until fully paid.',
  },
  {
    name: 'Professional Services Contract',
    content: '1. Payments are due within 14 days of receiving this invoice.\n2. Late payments will incur a 2% monthly interest charge.\n3. Out-of-pocket expenses are billed at cost.',
  },
];

function EditIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

interface TermsTemplatesViewProps {
  selectedSection?: string;
  termsTemplates: TermsTemplate[];
  editingTemplate: TermsTemplate | null;
  setEditingTemplate: React.Dispatch<React.SetStateAction<TermsTemplate | null>>;
  loadTemplates: () => Promise<void>;
}

export const TermsTemplatesView: React.FC<TermsTemplatesViewProps> = ({
  selectedSection,
  termsTemplates,
  editingTemplate,
  setEditingTemplate,
  loadTemplates,
}) => {
  if (selectedSection && selectedSection !== 'section-terms') {
    return null;
  }

  const handleSaveTemplate = async () => {
    if (!editingTemplate || !editingTemplate.name.trim()) {
      toast('Name required', 'warning');
      return;
    }
    await saveTermsTemplate({ ...editingTemplate });
    toast('Template saved!', 'success');
    setEditingTemplate(null);
    loadTemplates();
  };

  const handleDeleteTemplate = async (id: string) => {
    if (
      await confirmAction({
        title: 'Delete this template?',
        message: 'Existing invoices that used this Terms preset keep their text — this only removes the reusable template.',
        confirmLabel: 'Delete',
        tone: 'danger',
      })
    ) {
      await deleteTermsTemplate(id);
      toast('Deleted', 'success');
      loadTemplates();
    }
  };

  return (
    <div id="section-terms" className="glass-panel p-6 mb-6" style={{ order: 3 }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="section-title" style={{ margin: 0 }}>Terms & Conditions Templates</h3>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setEditingTemplate({ id: '', name: '', content: '' })}
        >
          <Plus size={16} /> New Template
        </button>
      </div>
      <p className="page-subtitle mb-4">Create reusable templates or pick from ready-made ones below.</p>

      {/* Quick Templates */}
      {!editingTemplate && (
        <div className="quick-templates-section">
          <p className="form-label" style={{ marginBottom: '0.5rem' }}>Quick Start — Pick a template for your business:</p>
          <div className="quick-templates-grid">
            {QUICK_START_TEMPLATES.map((qt, i) => (
              <button
                key={i}
                type="button"
                className="quick-template-btn"
                onClick={async () => {
                  await saveTermsTemplate({ name: qt.name, content: qt.content });
                  toast(`Added: ${qt.name}`, 'success');
                  loadTemplates();
                }}
              >
                <Plus size={14} /> {qt.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {editingTemplate && (
        <div className="template-editor">
          <div className="form-group">
            <label className="form-label">Template Name</label>
            <input
              type="text"
              className="form-input"
              value={editingTemplate.name}
              onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
              placeholder="e.g. Standard Terms, Export Terms"
            />
          </div>
          <div className="form-group">
            <Textarea
              label="Content (paste your terms here)"
              rows={8}
              value={editingTemplate.content}
              onChange={e => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
              placeholder="Paste or type your terms & conditions..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn btn-secondary" onClick={() => setEditingTemplate(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSaveTemplate}>
              <Save size={16} /> Save Template
            </button>
          </div>
        </div>
      )}

      {termsTemplates.length === 0 && !editingTemplate ? (
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>No templates yet.</p>
      ) : (
        <div className="template-list">
          {termsTemplates.map(tpl => (
            <div key={tpl.id} className="template-card">
              <div className="template-card-header">
                <strong>{tpl.name}</strong>
                <div className="flex gap-2">
                  <button
                    className="icon-btn icon-btn-blue"
                    onClick={() => setEditingTemplate({ ...tpl })}
                    title="Edit"
                  >
                    <EditIcon size={14} />
                  </button>
                  <button
                    className="icon-btn icon-btn-red"
                    onClick={() => handleDeleteTemplate(tpl.id)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="template-card-preview">{tpl.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TermsTemplatesView;
