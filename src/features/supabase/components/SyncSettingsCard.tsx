import React, { useState } from 'react';
import {
  Sliders,
  Save,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  GitCompare,
} from 'lucide-react';
import { SupabaseConfigState } from '../types';
import { toast } from '../../../shared/components/feedback/Toast';
import { Switch, Radio } from '@/shared/components/ui';

interface SyncSettingsCardProps {
  config: SupabaseConfigState;
  onSave: (updated: Partial<SupabaseConfigState>) => Promise<{ ok: boolean; error?: string }>;
}

export const SyncSettingsCard: React.FC<SyncSettingsCardProps> = ({
  config,
  onSave,
}) => {
  const [autoSync, setAutoSync] = useState(config.autoSyncOnSave);
  const [conflictStrategy, setConflictStrategy] = useState<'local_wins' | 'cloud_wins'>(
    config.conflictStrategy || 'local_wins'
  );
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setAutoSync(config.autoSyncOnSave);
    setConflictStrategy(config.conflictStrategy || 'local_wins');
  }, [config.autoSyncOnSave, config.conflictStrategy]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await onSave({
      autoSyncOnSave: autoSync,
      conflictStrategy,
    });
    setSaving(false);
    if (res.ok) {
      toast('Sync preferences updated successfully', 'success');
    } else {
      toast(`Failed to update preferences: ${res.error}`, 'error');
    }
  };

  return (
    <div
      id="sync-settings-card"
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100 dark:border-gray-700/60">
        <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-semibold">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Sync Preferences & Conflict Rules
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Configure automatic background sync and deterministic conflict resolution
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Auto Sync Toggle */}
        <div className="flex items-start justify-between p-3.5 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-900/40">
          <div className="pr-4">
            <label
              htmlFor="auto-sync-checkbox"
              className="text-xs font-semibold text-gray-900 dark:text-gray-200 cursor-pointer block"
            >
              Automatic Real-time Sync on Save
            </label>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Whenever you create or update an invoice or customer locally, automatically upsert it to Supabase in the background.
            </p>
          </div>
          <Switch
            id="auto-sync-checkbox"
            checked={autoSync}
            onChange={(checked) => setAutoSync(checked)}
          />
        </div>

        {/* Conflict Resolution Strategy */}
        <div>
          <label className="block text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
            Conflict Resolution Strategy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors flex flex-col justify-between ${
                conflictStrategy === 'local_wins'
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 dark:border-purple-600'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Radio
                  name="conflictStrategy"
                  value="local_wins"
                  checked={conflictStrategy === 'local_wins'}
                  onChange={() => setConflictStrategy('local_wins')}
                />
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Local Wins (Recommended)
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-5">
                Local edits on this device take precedence. Prevents accidental overwrite of unsaved offline ledger state.
              </p>
            </label>

            <label
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors flex flex-col justify-between ${
                conflictStrategy === 'cloud_wins'
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 dark:border-purple-600'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Radio
                  name="conflictStrategy"
                  value="cloud_wins"
                  checked={conflictStrategy === 'cloud_wins'}
                  onChange={() => setConflictStrategy('cloud_wins')}
                />
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Cloud Wins
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-5">
                Remote Supabase records overwrite local records with matching IDs during download operations.
              </p>
            </label>
          </div>
        </div>

        {/* Save Preferences Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            id="save-sync-preferences-btn"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving Preferences...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};
