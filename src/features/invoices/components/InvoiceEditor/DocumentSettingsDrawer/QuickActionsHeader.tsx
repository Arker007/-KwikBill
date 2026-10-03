import React from 'react';
import { Heart, Sliders, ListOrdered, FileText, Lock, HelpCircle } from 'lucide-react';

interface QuickActionsHeaderProps {
  onSelectAction: (actionKey: 'templates' | 'custom-fields' | 'prefixes' | 'notes-terms') => void;
}

export const QuickActionsHeader: React.FC<QuickActionsHeaderProps> = ({ onSelectAction }) => {
  return (
    <div className="mb-6">
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5 tracking-wide">
        Quick actions
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Invoice templates */}
        <button
          type="button"
          onClick={() => onSelectAction('templates')}
          className="flex flex-col items-start text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-xs transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Heart size={16} className="fill-rose-500/20 dark:fill-rose-400/20" />
          </div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            Invoice templates
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
            Professional templates for every business need
          </div>
        </button>

        {/* Custom fields */}
        <button
          type="button"
          onClick={() => onSelectAction('custom-fields')}
          className="flex flex-col items-start text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Sliders size={16} />
          </div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            Custom fields
            <span className="text-slate-400 dark:text-slate-500 text-[10px]">✨</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
            Add custom fields in the PDFs that suit your business.
          </div>
        </button>

        {/* Prefixes / suffixes */}
        <button
          type="button"
          onClick={() => onSelectAction('prefixes')}
          className="flex flex-col items-start text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-xs transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <ListOrdered size={16} />
          </div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
            Prefixes / suffixes
            <HelpCircle size={13} className="text-slate-400" />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
            Customize invoice serial numbers and sequences.
          </div>
        </button>

        {/* Notes and terms */}
        <button
          type="button"
          onClick={() => onSelectAction('notes-terms')}
          className="flex flex-col items-start text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xs transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <FileText size={16} />
          </div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            Notes and terms
            <span className="text-slate-400 dark:text-slate-500 text-[10px]">📄</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
            Default footer text, terms, and notes on PDFs.
          </div>
        </button>
      </div>
    </div>
  );
};
