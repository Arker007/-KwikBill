import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Check,
  Copy,
  Sparkles,
  Save,
  BookOpen,
} from 'lucide-react';
import { TermsTemplate } from '../types';
import { toast } from '@/shared/components/feedback/Toast';
import { confirmAction } from '@/shared/components/feedback/ConfirmModal';

export interface NotesTermsViewProps {
  termsTemplates: TermsTemplate[];
  setTermsTemplates: React.Dispatch<React.SetStateAction<TermsTemplate[]>>;
  defaultNotes?: string;
  defaultTerms?: string;
  onSaveDefaultTerms?: (terms: string, notes?: string) => Promise<void>;
}

const PRESET_TEMPLATES: TermsTemplate[] = [
  {
    id: 'preset-retail',
    name: 'Standard Retail (7-Day Exchange)',
    content: `1. Goods once sold can be exchanged within 7 days with original invoice.\n2. No cash refund will be provided for returned merchandise.\n3. Items must be in original condition with tags and packaging intact.\n4. Subject to local jurisdiction only.`,
  },
  {
    id: 'preset-b2b',
    name: 'B2B Wholesale / Manufacturing (30 Days Credit)',
    content: `1. Payment is due within 30 days of the invoice date.\n2. Interest @ 18% per annum will be charged on overdue payments beyond due date.\n3. Goods remain our property until full payment is received.\n4. All disputes are subject to local state court jurisdiction.`,
  },
  {
    id: 'preset-service',
    name: 'IT Services & Consulting',
    content: `1. 50% advance along with work order, balance upon delivery & signoff.\n2. Source code and deliverables transfer upon full settlement.\n3. Taxes as applicable by Government of India.\n4. Quotation valid for 15 days from date of issue.`,
  },
  {
    id: 'preset-transport',
    name: 'Logistics & Delivery Notes',
    content: `1. Delivery is subject to road permits and e-Way bill compliance.\n2. Transit insurance is the responsibility of the consignee unless specified.\n3. Claims for transit damage must be lodged within 24 hours of delivery.`,
  },
];

export const NotesTermsView: React.FC<NotesTermsViewProps> = ({
  termsTemplates,
  setTermsTemplates,
  defaultNotes = 'Thank you for your business! We look forward to serving you again.',
  defaultTerms = '1. Goods once sold will not be taken back or exchanged.\n2. Interest @ 18% p.a. will be charged on overdue invoices.\n3. All disputes are subject to local jurisdiction only.',
  onSaveDefaultTerms,
}) => {
  const [activeDefaultTerms, setActiveDefaultTerms] = useState(defaultTerms);
  const [activeDefaultNotes, setActiveDefaultNotes] = useState(defaultNotes);
  const [editingTemplate, setEditingTemplate] = useState<TermsTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplContent, setTplContent] = useState('');
  const [savingDefault, setSavingDefault] = useState(false);

  const openNewModal = () => {
    setEditingTemplate(null);
    setTplName('');
    setTplContent('');
    setIsModalOpen(true);
  };

  const openEditModal = (tpl: TermsTemplate) => {
    setEditingTemplate(tpl);
    setTplName(tpl.name);
    setTplContent(tpl.content);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim() || !tplContent.trim()) {
      toast('Please enter both template name and terms text', 'warning');
      return;
    }

    if (editingTemplate) {
      setTermsTemplates((prev) =>
        prev.map((t) => (t.id === editingTemplate.id ? { ...t, name: tplName.trim(), content: tplContent.trim() } : t))
      );
      toast('Template updated successfully', 'success');
    } else {
      const newTpl: TermsTemplate = {
        id: 'tpl_' + Date.now(),
        name: tplName.trim(),
        content: tplContent.trim(),
      };
      setTermsTemplates((prev) => [...prev, newTpl]);
      toast('New template created', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      await confirmAction({
        title: `Delete template "${name}"?`,
        message: 'This cannot be undone.',
        confirmLabel: 'Delete',
        tone: 'danger',
      })
    ) {
      setTermsTemplates((prev) => prev.filter((t) => t.id !== id));
      toast('Template deleted', 'info');
    }
  };

  const applyTemplateToDefault = (content: string) => {
    setActiveDefaultTerms(content);
    toast('Template applied to Default Terms & Conditions below! Click Save to apply.', 'info');
  };

  const handleSaveDefault = async () => {
    setSavingDefault(true);
    try {
      if (onSaveDefaultTerms) {
        await onSaveDefaultTerms(activeDefaultTerms, activeDefaultNotes);
      }
      toast('Default Notes & Terms saved for all new invoices!', 'success');
    } catch {
      toast('Failed to save default terms', 'error');
    }
    setSavingDefault(false);
  };

  return (
    <div className="space-y-8" id="notes-terms-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#1E61EB]" />
            <span>Terms &amp; Conditions and Notes Templates</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage reusable statutory terms, exchange policies, and default greeting notes for invoices, quotations, and challans.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewModal}
          className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Custom Template</span>
        </button>
      </div>

      {/* Section 1: Default Invoice Terms & Notes */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2">
            <Save className="w-4 h-4 text-gray-500" />
            <span>Default Invoice Notes &amp; Legal Terms</span>
          </h3>
          <span className="text-[11px] text-gray-400 font-medium">Auto-populates new invoices</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Default Terms &amp; Conditions (Printed on left/bottom of invoice)
            </label>
            <textarea
              rows={5}
              value={activeDefaultTerms}
              onChange={(e) => setActiveDefaultTerms(e.target.value)}
              className="w-full p-2.5 rounded border border-gray-200 text-xs font-mono focus:outline-none focus:border-black"
              placeholder="1. Goods once sold..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Customer Note / Greeting Message
            </label>
            <textarea
              rows={5}
              value={activeDefaultNotes}
              onChange={(e) => setActiveDefaultNotes(e.target.value)}
              className="w-full p-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
              placeholder="e.g. Thank you for your business..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={savingDefault}
            onClick={handleSaveDefault}
            className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold py-2 px-5 rounded-md transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingDefault ? 'Saving...' : 'Save Default Terms'}</span>
          </button>
        </div>
      </div>

      {/* Section 2: Custom Saved Templates */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
          <BookOpen className="w-4 h-4 text-gray-500" />
          <span>Saved Custom Templates ({termsTemplates.length})</span>
        </h3>

        {termsTemplates.length === 0 ? (
          <p className="text-xs text-gray-400 py-3 text-center">
            No custom templates saved yet. Click "New Custom Template" or choose from industry presets below.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {termsTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900">{tpl.name}</span>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(tpl)}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded"
                        title="Edit template"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tpl.id, tpl.name)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600 font-mono whitespace-pre-line mt-2 line-clamp-4">
                    {tpl.content}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => applyTemplateToDefault(tpl.content)}
                  className="mt-3 w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium py-1.5 rounded transition-colors flex items-center justify-center space-x-1"
                >
                  <Copy className="w-3 h-3 text-[#1E61EB]" />
                  <span>Use as Current Default</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Ready-Made Industry Presets */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Industry Ready-Made Presets</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_TEMPLATES.map((preset) => (
            <div
              key={preset.id}
              className="p-4 rounded-lg border border-purple-100 bg-purple-50/20 space-y-2 flex flex-col justify-between"
            >
              <div>
                <span className="font-bold text-xs text-purple-950">{preset.name}</span>
                <p className="text-[11px] text-gray-600 font-mono whitespace-pre-line mt-2 line-clamp-4">
                  {preset.content}
                </p>
              </div>

              <div className="flex gap-2 mt-3 pt-2 border-t border-purple-100/60">
                <button
                  type="button"
                  onClick={() => applyTemplateToDefault(preset.content)}
                  className="flex-1 bg-white border border-purple-200 hover:bg-purple-50 text-purple-900 text-xs font-medium py-1.5 rounded transition-colors flex items-center justify-center space-x-1"
                >
                  <Check className="w-3 h-3 text-purple-600" />
                  <span>Apply to Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newTpl: TermsTemplate = {
                      id: 'tpl_' + Date.now(),
                      name: preset.name,
                      content: preset.content,
                    };
                    setTermsTemplates((prev) => [...prev, newTpl]);
                    toast(`Saved "${preset.name}" to your templates!`, 'success');
                  }}
                  className="px-3 border border-purple-200 bg-white hover:bg-purple-50 text-purple-800 text-xs rounded transition-colors"
                  title="Save as custom template"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                {editingTemplate ? 'Edit Template' : 'New Terms Template'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  required
                  placeholder="e.g. Export 60-Day Terms"
                  className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Terms Content *</label>
                <textarea
                  rows={6}
                  value={tplContent}
                  onChange={(e) => setTplContent(e.target.value)}
                  required
                  placeholder="1. Terms item 1..."
                  className="w-full p-2.5 rounded border border-gray-200 text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-gray-200 text-gray-700 text-xs font-medium py-1.5 px-4 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E61EB] text-white text-xs font-semibold py-1.5 px-4 rounded-md hover:bg-[#174ec4]"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesTermsView;
