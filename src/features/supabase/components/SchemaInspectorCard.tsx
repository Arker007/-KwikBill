import React, { useState } from 'react';
import {
  FileCode2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Code2,
  Info,
} from 'lucide-react';
import { SupabaseTableStatus } from '../types';
import { SUPABASE_SQL_SCHEMA } from '../constants/sqlSchema';
import { toast } from '../../../shared/components/feedback/Toast';

interface SchemaInspectorCardProps {
  tables: SupabaseTableStatus[];
  checking: boolean;
  onVerifyTables: () => Promise<{ ok: boolean; allRequiredExist?: boolean; error?: string }>;
  isConfigured: boolean;
}

const DEFAULT_REQUIRED_TABLES = [
  { name: 'business_profiles', label: 'Business Profiles' },
  { name: 'clients', label: 'Clients / Customers' },
  { name: 'products', label: 'Products & Stock' },
  { name: 'bills', label: 'Invoices & Sales' },
  { name: 'expenses', label: 'Operating Expenses' },
  { name: 'purchases', label: 'Purchases & Inward' },
  { name: 'receipts', label: 'Payment Receipts' },
  { name: 'recurring', label: 'Recurring Schedules' },
  { name: 'sync_audit_log', label: 'Sync Audit Ledger' },
];

export const SchemaInspectorCard: React.FC<SchemaInspectorCardProps> = ({
  tables,
  checking,
  onVerifyTables,
  isConfigured,
}) => {
  const [copied, setCopied] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopied(true);
      toast('Full PostgreSQL schema copied to clipboard! Paste it into Supabase SQL Editor.', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast('Could not copy automatically. Select and copy from preview.', 'warning');
      setShowSqlPreview(true);
    }
  };

  const tableList = DEFAULT_REQUIRED_TABLES.map((def) => {
    const found = tables.find((t) => t.name === def.name);
    return {
      ...def,
      exists: found ? found.exists : false,
    };
  });

  const existingCount = tableList.filter((t) => t.exists).length;
  const allReady = existingCount === tableList.length;

  return (
    <div
      id="schema-inspector-card"
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-700/60 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Database Schema & Table Inspector
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Inspect required PostgreSQL tables and copy schema migration scripts
            </p>
          </div>
        </div>

        {/* Status Pill & Actions */}
        <div className="flex items-center gap-2">
          {tables.length > 0 && (
            <span
              id="tables-verified-pill"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                allReady
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
              }`}
            >
              {allReady ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
              {existingCount} / {tableList.length} Tables Active
            </span>
          )}

          <button
            type="button"
            id="verify-tables-btn"
            onClick={onVerifyTables}
            disabled={checking || !isConfigured}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            title="Inspect tables on remote Supabase instance"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking...' : 'Check Tables'}
          </button>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-5">
        {tableList.map((tbl) => (
          <div
            key={tbl.name}
            className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-900/40 text-xs"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-mono text-gray-900 dark:text-gray-200 font-medium truncate">
                {tbl.name}
              </span>
              <span className="text-gray-400 text-[11px] truncate hidden md:inline">
                ({tbl.label})
              </span>
            </div>
            <div>
              {tbl.exists ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                  <XCircle className="w-3.5 h-3.5" /> Missing
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SQL Setup Helper Banner */}
      <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-xs text-gray-600 dark:text-gray-300">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-0.5">
            Initial Database Setup
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Open Supabase &gt; SQL Editor, paste the script, and click "Run" to bootstrap all 9 tables, indexes, and RLS policies.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            id="toggle-sql-preview-btn"
            onClick={() => setShowSqlPreview(!showSqlPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Code2 className="w-3.5 h-3.5" />
            {showSqlPreview ? 'Hide SQL' : 'View SQL'}
          </button>

          <button
            type="button"
            id="copy-sql-schema-btn"
            onClick={handleCopySql}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-sm transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy SQL Schema'}
          </button>
        </div>
      </div>

      {showSqlPreview && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1 px-1">
            <span>Supabase DDL Script (9 Tables + Indexes + Policies)</span>
            <span>235 lines</span>
          </div>
          <pre className="max-h-64 overflow-y-auto p-3 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono border border-gray-800 leading-relaxed selection:bg-blue-800">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      )}
    </div>
  );
};
