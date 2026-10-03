import React from 'react';
import {
  Database,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  Server,
} from 'lucide-react';
import {
  useSupabaseSync,
  SupabaseConfigCard,
  SchemaInspectorCard,
  MigrationControlCard,
  SyncSettingsCard,
  SyncAuditTable,
} from '../features/supabase';

export interface SupabasePageProps {
  onBack?: () => void;
}

export const SupabasePage: React.FC<SupabasePageProps> = ({ onBack }) => {
  const {
    config,
    connectionStatus,
    latencyMs,
    connectionError,
    tables,
    checkingTables,
    localSummary,
    loadingSummary,
    auditLogs,
    loadingAudit,
    syncState,
    saveConfig,
    testConnection,
    inspectTables,
    loadLocalSummary,
    loadAuditLogs,
    startSyncUp,
    startSyncDown,
  } = useSupabaseSync();

  return (
    <div
      id="supabase-hub-page"
      className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6 antialiased"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              id="supabase-back-btn"
              onClick={onBack}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-sm">
            <Database className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
              Supabase Cloud Database
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                PostgreSQL Hub
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Securely connect, synchronize, and migrate your local GST records with Supabase cloud infrastructure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://supabase.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Supabase Docs
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Safety Guarantee Notice */}
      <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Local-First Safety & Data Sovereignty Guarantee</p>
          <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/80 leading-relaxed">
            Your application remains 100% functional offline using local JSON files in <code>./data/</code>. Cloud synchronization is optional. Every download operation automatically creates an immutable backup snapshot in <code>./data/backups/</code> prior to writing to disk.
          </p>
        </div>
      </div>

      {/* Primary Configuration & Inspector */}
      <div className="space-y-6">
        <SupabaseConfigCard
          config={config}
          connectionStatus={connectionStatus}
          latencyMs={latencyMs}
          connectionError={connectionError}
          onSave={saveConfig}
          onTest={testConnection}
        />

        <SchemaInspectorCard
          tables={tables}
          checking={checkingTables}
          onVerifyTables={inspectTables}
          isConfigured={config.configured}
        />

        <MigrationControlCard
          localSummary={localSummary}
          loadingSummary={loadingSummary}
          syncState={syncState}
          onRefreshSummary={loadLocalSummary}
          onSyncUp={startSyncUp}
          onSyncDown={startSyncDown}
          isConfigured={config.configured}
        />

        <SyncSettingsCard
          config={config}
          onSave={saveConfig}
        />

        <SyncAuditTable
          auditLogs={auditLogs}
          loading={loadingAudit}
          onRefresh={loadAuditLogs}
        />
      </div>
    </div>
  );
};

export default SupabasePage;
