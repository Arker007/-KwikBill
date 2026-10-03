import React from 'react';

interface InvoiceTotalsSectionProps {
  allProfiles: any[];
  activeProfile: any;
  setActiveProfile: (profile: any) => void;
  profileProp?: any;
  invoiceType?: string;
  handleTypeChange?: (type: string) => void;
  details?: any;
  setDetails?: React.Dispatch<React.SetStateAction<any>>;
  invoiceOptions?: any;
  setInvoiceOptions?: React.Dispatch<React.SetStateAction<any>>;
  toggleOption?: (key: string) => void;
  showOptions?: boolean;
  setShowOptions?: (val: boolean) => void;
  profile?: any;
  clampNonNeg?: (val: any) => number;
}

export function InvoiceTotalsSection({
  allProfiles,
  activeProfile,
  setActiveProfile,
  profileProp,
}: InvoiceTotalsSectionProps) {
  const activeProf = activeProfile || profileProp;

  if (!allProfiles || allProfiles.length <= 1) {
    return null;
  }

  return (
    <div id="fgsb-invoice-totals-and-config-section">
      {/* Business Profile Selector — shown only if multiple profiles saved */}
      <div className="glass-panel p-6 mb-6">
        <h3 className="section-title font-bold text-slate-800 dark:text-slate-100 mb-3">
          Billing From (Business Profile)
        </h3>
        <div className="flex flex-wrap gap-2">
          {allProfiles.map((bp) => {
            const isSelected =
              (activeProf?.businessName || profileProp?.businessName) === bp.businessName;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => setActiveProfile(bp)}
                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-150 cursor-pointer font-medium ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {bp.businessName}
                {bp.gstin && <span className="text-xs ml-1.5 opacity-70">({bp.gstin})</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

