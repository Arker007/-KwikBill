import React, { useState } from 'react';
import { Save, RefreshCw, Download } from 'lucide-react';
import { StockAlertSettings, UpdateInfo } from '../types';
import { FEATURE_GROUPS, isModuleEnabled } from '../../../shared/utils';
import { saveStockAlertSettings, setRegionMode, setEnabledModules, getEnabledModules } from '../../../store';
import { toast } from '../../../shared/components/feedback/Toast';

interface ModuleTogglesTabProps {
  selectedSection?: string;
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

export const ModuleTogglesTab: React.FC<ModuleTogglesTabProps> = ({
  selectedSection,
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

  const toggleModule = async (moduleId: string) => {
    const next = { ...enabledModules, [moduleId]: !isModuleEnabled(moduleId, enabledModules) };
    setEnabledModulesState(next);
    await setEnabledModules(next);
    toast('Modules updated', 'info', 2000);
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
        : 'Switched to Both / Auto (all countries available)',
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

  const showAll = !selectedSection;

  return (
    <>
      {/* ---- Stock Alerts ---- */}
      {(showAll || selectedSection === 'section-stock') && (
        <div id="section-stock" className="glass-panel p-6 mb-6" style={{ order: 6 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem', marginBottom: '0.9rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: 10,
                background: 'rgba(245, 158, 11, 0.18)',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem',
              }}
            >
              🔔
            </div>
            <div>
              <h3 className="section-title" style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                Low-stock alerts
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Powers the 🔔 sidebar badge and the Dashboard low-stock list. The Inventory page colour-codes products against this threshold too.
              </p>
            </div>
          </div>

          {/* Master toggle row */}
          <div
            style={{
              padding: '0.75rem 0.9rem',
              background: 'var(--bg-secondary)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: stockAlerts.enabled ? '0.85rem' : 0,
            }}
          >
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer', margin: 0 }}>
              <input
                type="checkbox"
                checked={!!stockAlerts.enabled}
                onChange={e => setStockAlerts(prev => ({ ...prev, enabled: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Enable low-stock warnings</span>
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {stockAlerts.enabled
                ? `Flags products with stock ≤ ${stockAlerts.threshold} units`
                : 'Turned off — no badges or warnings will be shown'}
            </span>
          </div>

          {/* Threshold presets + custom input */}
          {stockAlerts.enabled && (
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ marginBottom: '0.4rem' }}>
                Alert threshold (flag when stock is at or below):
              </label>
              <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {[
                  { val: 0, label: '0', hint: 'Out of stock only' },
                  { val: 3, label: '3', hint: 'Strict / low volume' },
                  { val: 5, label: '5', hint: 'Default — good for most' },
                  { val: 10, label: '10', hint: 'Fast-moving items' },
                  { val: 20, label: '20', hint: 'Wholesale' },
                  { val: 50, label: '50', hint: 'High volume' },
                ].map(p => {
                  const active = stockAlerts.threshold === p.val;
                  return (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setStockAlerts(prev => ({ ...prev, threshold: p.val }))}
                      title={p.hint}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: 999,
                        background: active
                          ? 'linear-gradient(135deg, var(--primary), var(--primary-darker))'
                          : 'var(--bg-secondary)',
                        color: active ? '#fff' : 'var(--text)',
                        border: active ? '1px solid transparent' : '1px solid var(--border)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        minWidth: 44,
                        boxShadow: active ? '0 4px 10px rgba(var(--primary-rgb), 0.35)' : 'none',
                      }}
                    >
                      {p.label}
                      <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 500, opacity: 0.85, marginTop: 1 }}>
                        {p.hint}
                      </span>
                    </button>
                  );
                })}
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>or</span>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  step="1"
                  className="form-input"
                  style={{ width: 90 }}
                  value={stockAlerts.threshold}
                  onChange={e =>
                    setStockAlerts(prev => ({
                      ...prev,
                      threshold: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Changes take effect after saving</span>
            <button
              type="button"
              className="btn btn-primary"
              disabled={stockAlertsSaving}
              onClick={async () => {
                setStockAlertsSaving(true);
                try {
                  await saveStockAlertSettings(stockAlerts);
                  toast('Low-stock alert settings saved', 'success');
                } catch {
                  toast('Failed to save', 'error');
                }
                setStockAlertsSaving(false);
              }}
            >
              <Save size={16} /> {stockAlertsSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* ---- Modules / Features ---- */}
      {(showAll || selectedSection === 'section-modules') && (
        <div id="section-modules" className="glass-panel p-6 mb-6" style={{ order: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 className="section-title" style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                Modules
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                Turn off the features you don't need. They disappear from the sidebar and forms — your data stays untouched.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetModules}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem' }}
            >
              Reset to default
            </button>
          </div>
          <div
            style={{
              marginTop: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {FEATURE_GROUPS.map(group => (
              <div key={group.id} className="surface-card">
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    marginBottom: '0.15rem',
                  }}
                >
                  {group.label}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 0.6rem' }}>
                  {group.description}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {group.modules.map((mod: any) => {
                    const enabled = isModuleEnabled(mod.id, enabledModules);
                    if (mod.indiaOnly && regionMode === 'international') return null;
                    return (
                      <label
                        key={mod.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          fontSize: '0.78rem',
                          cursor: mod.core ? 'not-allowed' : 'pointer',
                          opacity: mod.core ? 0.55 : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={enabled}
                          disabled={mod.core}
                          onChange={() => !mod.core && toggleModule(mod.id)}
                          style={{ width: 15, height: 15, accentColor: 'var(--primary)', marginTop: '2px' }}
                        />
                        <span style={{ lineHeight: 1.35 }}>
                          {mod.label}
                          {mod.core && (
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginLeft: '0.4rem' }}>(always on)</span>
                          )}
                          {mod.indiaOnly && (
                            <span
                              style={{ fontSize: '0.65rem', color: '#94a3b8', marginLeft: '0.4rem' }}
                              title="India-only feature"
                            >
                              🇮🇳
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- Region Preference ---- */}
      {(showAll || selectedSection === 'section-region') && (
        <div id="section-region" className="glass-panel p-6 mb-6" style={{ order: 7 }}>
          <h3 className="section-title" style={{ marginTop: 0 }}>
            Region Preference
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.85rem' }}>
            Choose how the app behaves. You can change this any time without losing data.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'india', label: '🇮🇳 India only', desc: 'GST flows, INR-first, GSTR-1/3B, E-Way Bill, UPI QR' },
              { id: 'international', label: '🌍 International', desc: 'VAT/SST/TVA labels, multi-currency, no India-only flows' },
              { id: 'both', label: '🌐 Both / Auto', desc: 'Show all countries — pick per invoice (default)' },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleRegionChange(opt.id)}
                className={`type-chip ${regionMode === opt.id ? 'type-chip-active' : ''}`}
                title={opt.desc}
                style={{
                  flex: '1 1 200px',
                  minWidth: '200px',
                  textAlign: 'left',
                  padding: '0.6rem 0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.2rem',
                }}
              >
                <span style={{ fontWeight: 600 }}>{opt.label}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: regionMode === opt.id ? 'inherit' : '#94a3b8',
                    fontWeight: 400,
                  }}
                >
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- App Updates ---- */}
      {(showAll || selectedSection === 'section-updates') && (
        <div id="section-updates" className="glass-panel p-6 mb-6" style={{ order: 11 }}>
          <h3 className="section-title">App Updates</h3>
          <p className="page-subtitle mb-4">Check if a newer version is available.</p>
          <div className="flex gap-4 items-center">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={checkingUpdate}
              onClick={handleCheckUpdate}
            >
              <RefreshCw size={18} className={checkingUpdate ? 'spin' : ''} />
              {checkingUpdate ? 'Checking...' : 'Check for Updates'}
            </button>
            {updateInfo && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Current: v{updateInfo.current}
                {updateInfo.latest ? ` | Latest: v${updateInfo.latest}` : ''}
              </span>
            )}
          </div>
          {updateInfo?.updateAvailable && (
            <div className="update-available-box">
              <p>
                <strong>New version v{updateInfo.latest} is available!</strong>
              </p>
              <p>Your data will not be affected. Click below to update:</p>
              <a
                href="freegstbill-update://run"
                className="btn btn-primary"
                style={{ marginTop: '0.5rem', display: 'inline-flex', textDecoration: 'none' }}
              >
                <Download size={18} /> Update Now
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
};
