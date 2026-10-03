import React, { useState } from 'react';
import {
  Database,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Save,
} from 'lucide-react';
import { SupabaseConfigState, SupabaseConnectionStatus } from '../types';
import { toast } from '../../../shared/components/feedback/Toast';

interface SupabaseConfigCardProps {
  config: SupabaseConfigState;
  connectionStatus: SupabaseConnectionStatus;
  latencyMs: number | null;
  connectionError: string | null;
  onSave: (updated: Partial<SupabaseConfigState>) => Promise<{ ok: boolean; error?: string }>;
  onTest: (custom?: { 
    supabaseUrl: string; 
    supabaseAnonKey?: string;
    supabaseServiceKey?: string;
  }) => Promise<{ ok: boolean; latencyMs?: number; error?: string }>;
}

export const SupabaseConfigCard: React.FC<SupabaseConfigCardProps> = ({
  config,
  connectionStatus,
  latencyMs,
  connectionError,
  onSave,
  onTest,
}) => {
  const [url, setUrl] = useState(config.supabaseUrl || '');
  const [anonKey, setAnonKey] = useState(config.supabaseAnonKey || '');
  const [serviceKey, setServiceKey] = useState(config.supabaseServiceKey || '');
  const [showAnon, setShowAnon] = useState(false);
  const [showService, setShowService] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync internal state when config loads
  React.useEffect(() => {
    setUrl(config.supabaseUrl || '');
    setAnonKey(config.supabaseAnonKey || '');
    setServiceKey(config.supabaseServiceKey || '');
  }, [config.supabaseUrl, config.supabaseAnonKey, config.supabaseServiceKey]);

  const handleTest = async () => {
    if (!url.trim()) {
      toast('Please enter a valid Supabase Project URL', 'warning');
      return;
    }
    setTesting(true);
    const res = await onTest({
      supabaseUrl: url.trim(),
      supabaseAnonKey: anonKey.trim() || undefined,
      supabaseServiceKey: serviceKey.trim() || undefined,
    });
    setTesting(false);
    if (res.ok) {
      toast(`Connection successful (${res.latencyMs || 0} ms)`, 'success');
    } else {
      toast(`Connection failed: ${res.error || 'Check URL and Keys'}`, 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast('Supabase Project URL is required', 'warning');
      return;
    }
    setSaving(true);
    const res = await onSave({
      supabaseUrl: url.trim(),
      supabaseAnonKey: anonKey.trim(),
      supabaseServiceKey: serviceKey.trim(),
    });
    setSaving(false);
    if (res.ok) {
      toast('Supabase configuration saved securely', 'success');
    } else {
      toast(`Failed to save: ${res.error}`, 'error');
    }
  };

  return (
    <div
      id="supabase-config-card"
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-gray-100 dark:border-gray-700/60 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-semibold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Supabase Project Connection
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Connect to your hosted PostgreSQL database using PostgREST API keys
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {connectionStatus === 'connected' && (
            <span
              id="supabase-status-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected {latencyMs ? `(${latencyMs} ms)` : ''}
            </span>
          )}
          {connectionStatus === 'testing' && (
            <span
              id="supabase-status-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Testing...
            </span>
          )}
          {connectionStatus === 'error' && (
            <span
              id="supabase-status-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Connection Error
            </span>
          )}
          {connectionStatus === 'disconnected' && (
            <span
              id="supabase-status-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300"
            >
              Disconnected
            </span>
          )}
        </div>
      </div>

      {connectionError && (
        <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-lg flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div className="flex-1">
            <span className="font-semibold">Connection Check Failed: </span>
            <span>{connectionError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Project URL */}
        <div>
          <label
            htmlFor="supabase-url-input"
            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Supabase Project URL <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="supabase-url-input"
              type="text"
              required
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900/60 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Obtain from your Supabase Dashboard: <code>Project Settings &gt; API &gt; Project URL</code> (e.g. <code>https://your-ref.supabase.co</code>)
          </p>
        </div>

        {/* Anon / Public API Key */}
        <div>
          <label
            htmlFor="supabase-anon-key-input"
            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Anon / Publishable Key (anon public) <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              id="supabase-anon-key-input"
              type={showAnon ? 'text' : 'password'}
              required
              placeholder={config.hasAnonKey ? '••••••••' : 'sb_publishable_... or eyJhbGciOiJIUzI1Ni...'}
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full pl-3.5 pr-10 py-2 text-sm font-mono bg-gray-50 dark:bg-gray-900/60 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
            <button
              type="button"
              id="toggle-anon-visibility-btn"
              onClick={() => setShowAnon(!showAnon)}
              className="absolute right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
              title={showAnon ? 'Hide key' : 'Show key'}
              aria-label={showAnon ? 'Hide anon key' : 'Show anon key'}
            >
              {showAnon ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Found under <code>Project Settings &gt; API &gt; Project API Keys &gt; anon public</code> (supports new <code>sb_publishable_...</code> and legacy JWTs)
          </p>
        </div>

        {/* Service Role Key (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="supabase-service-key-input"
              className="block text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              Service Role Key <span className="text-gray-400 font-normal">(Optional — for administrative RLS bypass)</span>
            </label>
          </div>
          <div className="relative flex items-center">
            <input
              id="supabase-service-key-input"
              type={showService ? 'text' : 'password'}
              placeholder={config.hasServiceKey ? '••••••••' : 'Optional secret service_role key...'}
              value={serviceKey}
              onChange={(e) => setServiceKey(e.target.value)}
              className="w-full pl-3.5 pr-10 py-2 text-sm font-mono bg-gray-50 dark:bg-gray-900/60 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
            <button
              type="button"
              id="toggle-service-visibility-btn"
              onClick={() => setShowService(!showService)}
              className="absolute right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
              title={showService ? 'Hide key' : 'Show key'}
              aria-label={showService ? 'Hide service key' : 'Show service key'}
            >
              {showService ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
            Never share your service_role key. Used locally on your backend server only.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Open Supabase Dashboard
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="test-supabase-connection-btn"
              onClick={handleTest}
              disabled={testing || !url.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <button
              type="submit"
              id="save-supabase-config-btn"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Credentials'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
