import React, { useState } from 'react';
import {
  UploadCloud,
  DownloadCloud,
  Layers,
  FileText,
  Users,
  Package,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Clock,
  Archive,
  Copy,
  Check,
  FileCode2,
} from 'lucide-react';
import { LocalSummaryData, SyncOperationState } from '../types';
import { SUPABASE_SQL_SCHEMA } from '../constants/sqlSchema';
import { toast } from '../../../shared/components/feedback/Toast';
import { confirmAction } from '../../../shared/components/feedback/ConfirmModal';

interface MigrationControlCardProps {
  localSummary: LocalSummaryData | null;
  loadingSummary: boolean;
  syncState: SyncOperationState;
  onRefreshSummary: () => Promise<void>;
  onSyncUp: () => Promise<{ ok: boolean; data?: any; error?: string }>;
  onSyncDown: () => Promise<{ ok: boolean; data?: any; error?: string }>;
  isConfigured: boolean;
}

export const MigrationControlCard: React.FC<MigrationControlCardProps> = ({
  localSummary,
  loadingSummary,
  syncState,
  onRefreshSummary,
  onSyncUp,
  onSyncDown,
  isConfigured,
}) => {
  const counts = localSummary?.counts || {
    bills: 0,
    clients: 0,
    products: 0,
    expenses: 0,
    purchases: 0,
    receipts: 0,
    recurring: 0,
    businessProfiles: 0,
  };

  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSchema(true);
      toast('Full PostgreSQL schema copied to clipboard! Paste and Run in Supabase SQL Editor.', 'success');
      setTimeout(() => setCopiedSchema(false), 3000);
    } catch {
      toast('Could not copy automatically. You can copy it from Database Schema & Table Inspector below.', 'warning');
    }
  };

  const isSchemaMissing = Boolean(
    syncState.error &&
      (syncState.error.toLowerCase().includes('tables are not') ||
        syncState.error.toLowerCase().includes('schema cache') ||
        syncState.error.toLowerCase().includes('could not find the table') ||
        syncState.error.toLowerCase().includes('does not exist'))
  );

  const handleSyncUp = async () => {
    if (!isConfigured) {
      toast('Please configure and test your Supabase connection first.', 'warning');
      return;
    }

    const confirmed = await confirmAction({
      title: 'Upload Local Records to Supabase',
      message: `This will upsert ${localSummary?.total || 0} local records (invoices, clients, products, expenses, etc.) to your Supabase PostgreSQL database in batches of 50. Existing remote records with matching IDs will be updated. Proceed?`,
      confirmLabel: 'Upload Now',
      tone: 'default',
    });

    if (!confirmed) return;

    const res = await onSyncUp();
    if (res.ok) {
      const uploadedCount = res.data?.summary?.totalUploaded ?? res.data?.summary?.totalSynced ?? localSummary?.total ?? 0;
      toast(`Successfully uploaded ${uploadedCount} records to Supabase in ${res.data?.durationMs || 0}ms!`, 'success');
    } else {
      toast(`Upload failed: ${res.error || 'Please check schema and RLS policies'}`, 'error');
    }
  };

  const handleSyncDown = async () => {
    if (!isConfigured) {
      toast('Please configure and test your Supabase connection first.', 'warning');
      return;
    }

    const confirmed = await confirmAction({
      title: 'Download Remote Records from Supabase',
      message:
        'This will download all records from your Supabase database and merge them into local storage. An automatic safety snapshot will be created in ./data/backups/ before writing to disk. Proceed?',
      confirmLabel: 'Download & Merge',
      tone: 'default',
    });

    if (!confirmed) return;

    const res = await onSyncDown();
    if (res.ok) {
      toast(
        `Successfully merged ${res.data?.summary?.totalDownloaded || 0} records from Supabase! Safety backup created.`,
        'success'
      );
    } else {
      toast(`Download failed: ${res.error}`, 'error');
    }
  };

  return (
    <div
      id="migration-control-card"
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-700/60 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Data Synchronization & Migration
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Bi-directional batched sync with zero-loss safety snapshot guarantees
            </p>
          </div>
        </div>

        <button
          type="button"
          id="refresh-local-summary-btn"
          onClick={onRefreshSummary}
          disabled={loadingSummary || syncState.inProgress}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh record counts"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingSummary ? 'animate-spin' : ''}`} />
          {loadingSummary ? 'Refreshing...' : 'Refresh Counts'}
        </button>
      </div>

      {/* Local Records Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-900/40">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              Invoices
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {counts.bills}
          </p>
        </div>

        <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-900/40">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              Clients
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {counts.clients}
          </p>
        </div>

        <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-900/40">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-purple-500" />
              Products
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {counts.products}
          </p>
        </div>

        <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-900/40">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-amber-500" />
              Total Records
            </span>
          </div>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {localSummary?.total || 0}
          </p>
        </div>
      </div>

      {/* Progress Bar when Active */}
      {syncState.inProgress && (
        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <div className="flex items-center justify-between text-xs font-medium text-indigo-900 dark:text-indigo-200 mb-2">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              {syncState.type === 'upload' ? 'Uploading Local Data to Supabase...' : 'Downloading & Merging from Supabase...'}
            </span>
            <span>{syncState.progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300"
              style={{ width: `${syncState.progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-indigo-700 dark:text-indigo-300">
            {syncState.currentCollection || 'Processing...'}
          </p>
        </div>
      )}

      {/* Last Result Notice */}
      {syncState.lastResult && !syncState.inProgress && (
        <div className="mb-6 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">
              Sync Completed Successfully
            </p>
            <p className="text-[11px] opacity-90">
              Processed {syncState.lastResult.totalSynced || syncState.lastResult.summary?.totalSynced || syncState.lastResult.summary?.totalDownloaded || 0} records in {syncState.lastResult.durationMs || 0} ms.
              {syncState.lastResult.snapshotCreated && (
                <span className="block mt-1">
                  Safety snapshot saved to: <code>./data/backups/{syncState.lastResult.snapshotCreated}</code>
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {syncState.error && !syncState.inProgress && (
        <div className={`mb-6 p-4 rounded-xl border flex flex-col gap-3 text-xs ${
          isSchemaMissing
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          <div className="flex items-start gap-2.5">
            <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
              isSchemaMissing ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
            }`} />
            <div className="flex-1">
              <p className="font-semibold">
                {isSchemaMissing ? 'Initial Database Setup Required' : 'Synchronization Error'}
              </p>
              <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                {syncState.error}
              </p>
            </div>
          </div>

          {isSchemaMissing && (
            <div className="mt-1 pt-3 border-t border-amber-200/70 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <ol className="text-[11px] list-decimal list-inside space-y-0.5 text-amber-800 dark:text-amber-300 font-medium">
                <li>Click <strong>Copy SQL Schema</strong></li>
                <li>Go to <strong>Supabase Dashboard &gt; SQL Editor &gt; New Query</strong></li>
                <li>Paste the script and click <strong>Run</strong></li>
              </ol>

              <button
                type="button"
                id="error-banner-copy-schema-btn"
                onClick={handleCopySchema}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-lg shadow-sm transition-colors flex-shrink-0"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSchema ? 'Copied to Clipboard!' : 'Copy SQL Schema'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Upload Action */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UploadCloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Upload Local Data
              </h4>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Upserts your local invoices, clients, products, and receipts into Supabase in chunks of 50. Preserves all foreign key references.
            </p>
          </div>

          <button
            type="button"
            id="start-sync-up-btn"
            onClick={handleSyncUp}
            disabled={syncState.inProgress || !isConfigured}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Local Data to Supabase
          </button>
        </div>

        {/* Download Action */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DownloadCloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Download Remote Data
              </h4>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Fetches all remote records from Supabase and merges them locally. An immutable safety snapshot is always created prior to merge.
            </p>
          </div>

          <button
            type="button"
            id="start-sync-down-btn"
            onClick={handleSyncDown}
            disabled={syncState.inProgress || !isConfigured}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <DownloadCloud className="w-4 h-4" />
            Download Remote Data to Local
          </button>
        </div>
      </div>
    </div>
  );
};
