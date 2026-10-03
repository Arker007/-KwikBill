import React from 'react';
import { FileText, Lock, MessageSquare } from 'lucide-react';
import { Select, Textarea } from '@/shared/components/ui';

interface NotesTermsTabProps {
  termsTemplates?: any[];
  selectedTermsId?: string;
  setSelectedTermsId?: (id: string) => void;
  customTerms?: string;
  setCustomTerms?: (terms: string) => void;
  customNotes?: string;
  setCustomNotes?: (notes: string) => void;
  internalNote?: string;
  setInternalNote?: (note: string) => void;
  handleTermsSelect?: (id: string) => void;
}

export const NotesTermsTab: React.FC<NotesTermsTabProps> = ({
  termsTemplates = [],
  selectedTermsId = '',
  customTerms = '',
  setCustomTerms,
  customNotes = '',
  setCustomNotes,
  internalNote = '',
  setInternalNote,
  handleTermsSelect,
}) => {
  return (
    <div className="space-y-6">
      {/* Terms and Conditions */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Terms &amp; Conditions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Printed legally binding terms, return policies, and dispute jurisdictions
              </p>
            </div>
          </div>
          {termsTemplates.length > 0 && handleTermsSelect && (
            <div className="w-56">
              <Select
                value={selectedTermsId}
                onChange={(e) => handleTermsSelect(e.target.value)}
                options={[
                  { value: '', label: '— Apply Terms Template —' },
                  ...termsTemplates.map((t: any) => ({
                    value: t.id,
                    label: t.name || 'Untitled Template',
                  })),
                ]}
                selectSize="sm"
              />
            </div>
          )}
        </div>

        <div>
          <textarea
            rows={4}
            value={customTerms}
            onChange={(e) => setCustomTerms?.(e.target.value)}
            placeholder="1. Goods once sold will not be taken back or exchanged.&#10;2. Interest @ 18% p.a. will be charged for delayed payments.&#10;3. Subject to local jurisdiction only."
            className="form-input text-xs w-full resize-y font-mono"
          />
        </div>
      </div>

      {/* Customer Notes / Remarks */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <MessageSquare size={16} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Customer Notes / Remarks
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Public note visible on invoice footer (e.g. thank you message or bank payment details)
            </p>
          </div>
        </div>

        <div>
          <textarea
            rows={3}
            value={customNotes}
            onChange={(e) => setCustomNotes?.(e.target.value)}
            placeholder="Thank you for your business! Please make NEFT/RTGS payments to the account specified above."
            className="form-input text-xs w-full resize-y"
          />
        </div>
      </div>

      {/* Internal Private Notes */}
      {setInternalNote && (
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <Lock size={16} className="text-slate-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Internal Private Note (Not Printed on PDF)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Staff notes for payment tracking, sales rep commissions, or accounting reconciliation
              </p>
            </div>
          </div>

          <div>
            <textarea
              rows={2}
              value={internalNote}
              onChange={(e) => setInternalNote?.(e.target.value)}
              placeholder="e.g. Approved 5% special discount by Vishal on phone; follow up on 25th for balance."
              className="form-input text-xs w-full resize-y bg-slate-50/50 dark:bg-slate-850/50"
            />
          </div>
        </div>
      )}
    </div>
  );
};
