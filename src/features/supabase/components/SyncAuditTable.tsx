import React from 'react';
import {
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  FileCheck,
} from 'lucide-react';
import { SyncAuditItem } from '../types';

interface SyncAuditTableProps {
  auditLogs: SyncAuditItem[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export const SyncAuditTable: React.FC<SyncAuditTableProps> = ({
  auditLogs,
  loading,
  onRefresh,
}) => {
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      id="sync-audit-table-card"
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-700/60 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-semibold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Synchronization Audit Ledger
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Immutable ledger of recent cloud push and pull runs with latency and snapshot records
            </p>
          </div>
        </div>

        <button
          type="button"
          id="refresh-audit-log-btn"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh audit history"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Log'}
        </button>
      </div>

      {auditLogs.length === 0 ? (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          <FileCheck className="w-8 h-8 mx-auto text-gray-400 mb-2 opacity-50" />
          <p className="text-xs font-medium">No synchronization runs recorded yet.</p>
          <p className="text-[11px] text-gray-400 mt-1">
            Perform an upload or download above to initiate ledger logging.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Action</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Records</th>
                <th className="py-2.5 px-3 font-semibold">Duration</th>
                <th className="py-2.5 px-3 font-semibold">Details / Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {auditLogs.map((log, index) => {
                const isUpload = log.syncType === 'sync_up';
                const isSuccess = log.status === 'success';
                const isFailed = log.status === 'failed';

                return (
                  <tr
                    key={log.id || `audit-${index}`}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200">
                        {isUpload ? (
                          <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
                        ) : (
                          <DownloadCloud className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        {isUpload ? 'Upload to Cloud' : 'Download to Local'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {isSuccess && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Success
                        </span>
                      )}
                      {isFailed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                          <AlertCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                      {!isSuccess && !isFailed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          Partial
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {log.recordsCount}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {log.durationMs ? `${log.durationMs} ms` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-gray-500 dark:text-gray-400">
                      {log.errorMessage ? (
                        <span className="text-rose-600 dark:text-rose-400">{log.errorMessage}</span>
                      ) : log.snapshotCreated ? (
                        <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                          {log.snapshotCreated}
                        </span>
                      ) : (
                        <span>Triggered by {log.triggeredBy || 'user'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
