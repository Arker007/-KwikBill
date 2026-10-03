import React, { useState } from 'react';
import {
  Sliders,
  Bell,
  Layers,
  Globe,
  RefreshCw,
  Download,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { StockAlertSettings, UpdateInfo } from '../types';
import { FEATURE_GROUPS, isModuleEnabled } from '@/shared/utils';
import { saveStockAlertSettings, setRegionMode, setEnabledModules } from '@/store';
import { toast } from '@/shared/components/feedback/Toast';
import { Select } from '@/shared/components/ui/Select';

export interface PreferencesViewProps {
  enabledModules: Record<string, boolean>;
  setEnabledModulesState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  regionMode: string;
  setRegionModeState: (mode: string) => void;
  stockAlerts: StockAlertSettings;
  setStockAlerts: React.Dispatch<React.SetStateAction<StockAlertSettings>>;
  updateInfo: UpdateInfo | null;
  setUpdateInfo: React.Dispatch<React.SetStateAction<UpdateInfo | null>>;
  checkingUpdate: boolean;
  setCheckingUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PreferencesView: React.FC<PreferencesViewProps> = ({
  enabledModules,
  setEnabledModulesState,
  regionMode,
  setRegionModeState,
  stockAlerts,
  setStockAlerts,
  updateInfo,
  setUpdateInfo,
  checkingUpdate,
  setCheckingUpdate,
}) => {
  const [stockAlertsSaving, setStockAlertsSaving] = useState(false);
  const [roundingMode, setRoundingMode] = useState('rule119a');
  const [financialYear, setFinancialYear] = useState('2025-2026');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  const toggleModule = async (moduleId: string) => {
    const next = { ...enabledModules, [moduleId]: !isModuleEnabled(moduleId, enabledModules) };
    setEnabledModulesState(next);
    await setEnabledModules(next);
    toast('Module updated', 'info', 2000);
  };

  const resetModules = async () => {
    const defaults = {
      purchases: true,
      expenses: true,
      receipts: true,
      recurring: true,
      gstReturns: true,
      incomeTax: true,
      reports: true,
      ocr: true,
      auditLog: true,
    };
    setEnabledModulesState(defaults);
    await setEnabledModules(defaults);
    toast('Reset to default modules', 'info', 2000);
  };

  const handleRegionChange = (mode: string) => {
    setRegionMode(mode);
    setRegionModeState(mode);
    toast(
      mode === 'india'
        ? 'Switched to India (GST + INR default)'
        : mode === 'international'
        ? 'Switched to International (multi-currency, custom tax labels)'
        : 'Switched to Both / Auto',
      'info'
    );
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const res = await fetch('/api/check-update');
      const data = await res.json();
      setUpdateInfo(data);
      if (data.updateAvailable) {
        toast(`Update available: v${data.latest}`, 'info');
      } else if (data.error) {
        toast('Could not check for updates. Check internet connection.', 'warning');
      } else {
        toast('You are on the latest version!', 'success');
      }
    } catch {
      toast('Could not check for updates.', 'error');
    }
    setCheckingUpdate(false);
  };

  return (
    <div className="space-y-8" id="preferences-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#1E61EB]" />
            <span>Application Preferences &amp; Modules</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure regional statutory rules, inventory threshold alerts, optional modules, and app updates.
          </p>
        </div>
      </div>

      {/* Section 1: Accounting & Regional Preferences */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
          <Globe className="w-4 h-4 text-gray-500" />
          <span>Statutory Accounting &amp; Localization</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tax Regime &amp; Region</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'india', label: '🇮🇳 India GST', desc: 'CGST, SGST, IGST, UTGST, E-Way, e-Invoice' },
                { id: 'international', label: '🌍 International', desc: 'VAT / Multi-Currency' },
                { id: 'both', label: '🌐 Auto / Both', desc: 'All countries & formats' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleRegionChange(opt.id)}
                  className={`p-2.5 rounded-md border text-left transition-all ${
                    regionMode === opt.id
                      ? 'border-[#1E61EB] bg-blue-50/40 text-gray-900 font-semibold shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="text-xs">{opt.label}</div>
                  <div className="text-[10px] text-gray-400 font-normal">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Select
                label="Financial Year"
                value={financialYear}
                onChange={(e: any) => {
                  const val = typeof e === 'object' && e?.target ? e.target.value : e;
                  setFinancialYear(val);
                }}
                options={[
                  { value: '2025-2026', label: 'FY 2025-26 (Apr 2025 - Mar 2026)' },
                  { value: '2024-2025', label: 'FY 2024-25 (Apr 2024 - Mar 2025)' },
                  { value: '2026-2027', label: 'FY 2026-27 (Apr 2026 - Mar 2027)' },
                ]}
              />
            </div>

            <div>
              <Select
                label="Default Currency Symbol"
                value={currencySymbol}
                onChange={(e: any) => {
                  const val = typeof e === 'object' && e?.target ? e.target.value : e;
                  setCurrencySymbol(val);
                }}
                options={[
                  { value: '₹', label: '₹ (INR - Indian Rupee)' },
                  { value: '$', label: '$ (USD - US Dollar)' },
                  { value: '€', label: '€ (EUR - Euro)' },
                  { value: '£', label: '£ (GBP - British Pound)' },
                  { value: 'AED', label: 'AED (UAE Dirham)' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Select
                label="Rounding Method"
                value={roundingMode}
                onChange={(e: any) => {
                  const val = typeof e === 'object' && e?.target ? e.target.value : e;
                  setRoundingMode(val);
                }}
                options={[
                  { value: 'rule119a', label: 'Rule 119A Statutory Rounding (Nearest ₹1)' },
                  { value: 'exact', label: 'Exact 2 Decimals (No Rounding)' },
                  { value: 'ceiling', label: 'Ceiling (Always round up)' },
                ]}
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Complies with Section 170 / Rule 119A of the Indian Income Tax and GST Acts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Low-Stock Alerts */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Low-Stock Inventory Warnings</span>
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!stockAlerts.enabled}
              onChange={(e) => setStockAlerts((prev) => ({ ...prev, enabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E61EB]"></div>
          </label>
        </div>

        <p className="text-xs text-gray-500">
          Powers the sidebar inventory indicator and dashboard stock warnings when items dip below your safety threshold.
        </p>

        {stockAlerts.enabled && (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-medium text-gray-700">
              Alert Threshold (Flag product when stock &le;):
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { val: 0, label: '0', hint: 'Out of stock only' },
                { val: 3, label: '3', hint: 'Strict' },
                { val: 5, label: '5', hint: 'Standard (Recommended)' },
                { val: 10, label: '10', hint: 'Fast-Moving' },
                { val: 20, label: '20', hint: 'Wholesale' },
                { val: 50, label: '50', hint: 'High Volume' },
              ].map((p) => {
                const active = stockAlerts.threshold === p.val;
                return (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setStockAlerts((prev) => ({ ...prev, threshold: p.val }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      active
                        ? 'bg-[#1E61EB] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {p.label} <span className="text-[10px] font-normal opacity-80">({p.hint})</span>
                  </button>
                );
              })}
              <div className="flex items-center space-x-1 ml-2">
                <span className="text-xs text-gray-400">or custom:</span>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  value={stockAlerts.threshold}
                  onChange={(e) =>
                    setStockAlerts((prev) => ({
                      ...prev,
                      threshold: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                  className="w-16 h-7 px-2 rounded border border-gray-200 text-xs text-center"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={stockAlertsSaving}
                onClick={async () => {
                  setStockAlertsSaving(true);
                  try {
                    await saveStockAlertSettings(stockAlerts);
                    toast('Stock alert settings saved', 'success');
                  } catch {
                    toast('Failed to save', 'error');
                  }
                  setStockAlertsSaving(false);
                }}
                className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold py-1.5 px-4 rounded-md transition-colors flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{stockAlertsSaving ? 'Saving...' : 'Save Alert Threshold'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Feature Modules Hub */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-100 gap-2">
          <div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-gray-500" />
              <span>Feature Modules Hub</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Turn off features you don't use. Your data remains safe and instantly restorable.
            </p>
          </div>
          <button
            type="button"
            onClick={resetModules}
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium py-1 px-3 rounded-md transition-colors flex items-center space-x-1 self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {FEATURE_GROUPS.map((group) => (
            <div key={group.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 space-y-2.5">
              <div className="font-bold text-xs text-gray-900">{group.label}</div>
              <p className="text-[10px] text-gray-500 line-clamp-2">{group.description}</p>

              <div className="space-y-1.5 pt-1">
                {group.modules.map((mod: any) => {
                  const enabled = isModuleEnabled(mod.id, enabledModules);
                  if (mod.indiaOnly && regionMode === 'international') return null;

                  return (
                    <label
                      key={mod.id}
                      className={`flex items-center justify-between p-1.5 rounded text-xs transition-colors ${
                        mod.core ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-white'
                      }`}
                    >
                      <span className="flex items-center space-x-1.5">
                        <span className="text-gray-800 font-medium">{mod.label}</span>
                        {mod.core && <span className="text-[9px] text-gray-400">(Core)</span>}
                        {mod.indiaOnly && <span className="text-[10px]">🇮🇳</span>}
                      </span>
                      <input
                        type="checkbox"
                        checked={enabled}
                        disabled={mod.core}
                        onChange={() => !mod.core && toggleModule(mod.id)}
                        className="w-4 h-4 rounded text-[#1E61EB] focus:ring-0 cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Software Updates */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-gray-500" />
            <span>Software Updates &amp; Release Channel</span>
          </h3>
          <span className="text-xs font-mono font-semibold text-gray-600">v1.10.43 (Latest)</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50/70 rounded-lg border border-gray-100">
          <div>
            <div className="font-semibold text-xs text-gray-900">Current Build: Free GST Billing Software (Production)</div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Includes Budget 2025 statutory slabs, 15% capital gains surcharge cap, and Section 234 interest engine.
            </p>
          </div>

          <button
            type="button"
            disabled={checkingUpdate}
            onClick={handleCheckUpdate}
            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold py-1.5 px-4 rounded-md transition-colors flex items-center space-x-1.5 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
            <span>{checkingUpdate ? 'Checking...' : 'Check for Updates'}</span>
          </button>
        </div>

        {updateInfo?.updateAvailable && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-emerald-900">New Version Available: v{updateInfo.latest}</span>
              <p className="text-[11px] text-emerald-700">All local data and invoices remain 100% preserved.</p>
            </div>
            <a
              href="freegstbill-update://run"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 px-3 rounded-md flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Update Now</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferencesView;
