import { useState, useEffect, useCallback } from 'react';
import {
  SupabaseConfigState,
  SupabaseConnectionStatus,
  SupabaseTableStatus,
  LocalSummaryData,
  SyncAuditItem,
  SyncOperationState,
} from '../types';

export function useSupabaseSync() {
  const [config, setConfig] = useState<SupabaseConfigState>({
    supabaseUrl: '',
    supabaseAnonKey: '',
    supabaseServiceKey: '',
    autoSyncOnSave: false,
    conflictStrategy: 'local_wins',
    configured: false,
    hasAnonKey: false,
    hasServiceKey: false,
  });

  const [connectionStatus, setConnectionStatus] = useState<SupabaseConnectionStatus>('disconnected');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [tables, setTables] = useState<SupabaseTableStatus[]>([]);
  const [checkingTables, setCheckingTables] = useState(false);

  const [localSummary, setLocalSummary] = useState<LocalSummaryData | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [auditLogs, setAuditLogs] = useState<SyncAuditItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const [syncState, setSyncState] = useState<SyncOperationState>({
    inProgress: false,
    type: null,
    progressPercent: 0,
    currentCollection: undefined,
    error: null,
    lastResult: null,
  });

  // Load config from backend
  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/supabase/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(prev => ({
          ...prev,
          supabaseUrl: data.supabaseUrl || '',
          supabaseAnonKey: data.hasAnonKey ? '••••••••' : '',
          supabaseServiceKey: data.hasServiceKey ? '••••••••' : '',
          autoSyncOnSave: data.autoSyncOnSave || false,
          conflictStrategy: data.conflictStrategy || 'local_wins',
          configured: data.configured || false,
          hasAnonKey: data.hasAnonKey || false,
          hasServiceKey: data.hasServiceKey || false,
        }));
        if (data.configured) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
        }
      }
    } catch (err: any) {
      console.error('Failed to load Supabase config:', err);
    }
  }, []);

  // Save config to backend
  const saveConfig = useCallback(async (newConfig: Partial<SupabaseConfigState>) => {
    try {
      const payload: Record<string, any> = {
        supabaseUrl: newConfig.supabaseUrl,
        autoSyncOnSave: newConfig.autoSyncOnSave,
        conflictStrategy: newConfig.conflictStrategy,
      };

      // Only send keys if changed from mask
      if (newConfig.supabaseAnonKey && !newConfig.supabaseAnonKey.includes('•')) {
        payload.supabaseAnonKey = newConfig.supabaseAnonKey;
      }
      if (newConfig.supabaseServiceKey && !newConfig.supabaseServiceKey.includes('•')) {
        payload.supabaseServiceKey = newConfig.supabaseServiceKey;
      }

      const res = await fetch('/api/supabase/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || (data && data.ok === false)) {
        throw new Error(data?.error || 'Failed to save configuration');
      }

      await loadConfig();
      return { ok: true, message: data?.message || 'Configuration saved' };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }, [loadConfig]);

  // Test live connection
  const testConnection = useCallback(async (customConfig?: { 
    supabaseUrl: string; 
    supabaseAnonKey?: string;
    supabaseServiceKey?: string;
  }) => {
    setConnectionStatus('testing');
    setConnectionError(null);
    try {
      const body = customConfig
        ? {
            supabaseUrl: customConfig.supabaseUrl,
            supabaseAnonKey: customConfig.supabaseAnonKey && !customConfig.supabaseAnonKey.includes('•')
              ? customConfig.supabaseAnonKey
              : undefined,
            supabaseServiceKey: customConfig.supabaseServiceKey && !customConfig.supabaseServiceKey.includes('•')
              ? customConfig.supabaseServiceKey
              : undefined,
          }
        : {};

      const res = await fetch('/api/supabase/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setConnectionStatus('connected');
        setLatencyMs(data.latencyMs || null);
        return { ok: true, latencyMs: data.latencyMs };
      } else {
        setConnectionStatus('error');
        setConnectionError(data.error || 'Failed to connect to Supabase');
        return { ok: false, error: data.error };
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setConnectionError(err.message || 'Network error while testing connection');
      return { ok: false, error: err.message };
    }
  }, []);

  // Inspect tables
  const inspectTables = useCallback(async () => {
    setCheckingTables(true);
    try {
      const res = await fetch('/api/supabase/tables');
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.tables)) {
        setTables(data.tables);
        return { ok: true, tables: data.tables, allRequiredExist: data.allRequiredExist };
      } else {
        return { ok: false, error: data.error || 'Failed to inspect tables' };
      }
    } catch (err: any) {
      return { ok: false, error: err.message };
    } finally {
      setCheckingTables(false);
    }
  }, []);

  // Fetch local data count summary
  const loadLocalSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/supabase/local-summary');
      const data = await res.json();
      if (res.ok && data.ok) {
        setLocalSummary(data);
      }
    } catch (err: any) {
      console.error('Failed to load local summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  // Fetch audit log
  const loadAuditLogs = useCallback(async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch('/api/supabase/audit-log');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setAuditLogs(data);
      }
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  }, []);

  // Trigger sync-up (upload to Supabase)
  const startSyncUp = useCallback(async () => {
    setSyncState({
      inProgress: true,
      type: 'upload',
      progressPercent: 20,
      currentCollection: 'Preparing local collections...',
      error: null,
      lastResult: null,
    });

    try {
      setSyncState(prev => ({ ...prev, progressPercent: 50, currentCollection: 'Uploading batches...' }));
      const res = await fetch('/api/supabase/sync-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggeredBy: 'user_ui' }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        let errorMsg = data?.error;
        if (!errorMsg && data?.summary?.collections) {
          const colErrors = Object.entries(data.summary.collections)
            .flatMap(([col, rep]: any) => (rep.errors || []).map((e: string) => `[${col}] ${e}`));
          if (colErrors.length > 0) {
            errorMsg = `Sync-up failed: ${colErrors.slice(0, 3).join('; ')}`;
          }
        }
        throw new Error(errorMsg || 'Sync-up failed: unable to upload data');
      }

      setSyncState({
        inProgress: false,
        type: 'upload',
        progressPercent: 100,
        currentCollection: 'Completed',
        error: null,
        lastResult: data,
      });

      await loadAuditLogs();
      return { ok: true, data };
    } catch (err: any) {
      setSyncState(prev => ({
        ...prev,
        inProgress: false,
        error: err.message,
        progressPercent: 0,
      }));
      return { ok: false, error: err.message };
    }
  }, [loadAuditLogs]);

  // Trigger sync-down (download from Supabase)
  const startSyncDown = useCallback(async (conflictStrategy?: 'local_wins' | 'cloud_wins') => {
    setSyncState({
      inProgress: true,
      type: 'download',
      progressPercent: 15,
      currentCollection: 'Creating safety backup snapshot...',
      error: null,
      lastResult: null,
    });

    try {
      setSyncState(prev => ({ ...prev, progressPercent: 50, currentCollection: 'Fetching remote tables & merging...' }));
      const res = await fetch('/api/supabase/sync-down', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conflictStrategy: conflictStrategy || config.conflictStrategy || 'local_wins',
          triggeredBy: 'user_ui',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        let errorMsg = data?.error;
        if (!errorMsg && data?.summary?.collections) {
          const colErrors = Object.entries(data.summary.collections)
            .flatMap(([col, rep]: any) => (rep.errors || []).map((e: string) => `[${col}] ${e}`));
          if (colErrors.length > 0) {
            errorMsg = `Sync-down failed: ${colErrors.slice(0, 3).join('; ')}`;
          }
        }
        throw new Error(errorMsg || 'Sync-down failed: unable to download data');
      }

      setSyncState({
        inProgress: false,
        type: 'download',
        progressPercent: 100,
        currentCollection: 'Completed',
        error: null,
        lastResult: data,
      });

      await loadLocalSummary();
      await loadAuditLogs();
      return { ok: true, data };
    } catch (err: any) {
      setSyncState(prev => ({
        ...prev,
        inProgress: false,
        error: err.message,
        progressPercent: 0,
      }));
      return { ok: false, error: err.message };
    }
  }, [config.conflictStrategy, loadLocalSummary, loadAuditLogs]);

  // Initial load
  useEffect(() => {
    loadConfig();
    loadLocalSummary();
    loadAuditLogs();
  }, [loadConfig, loadLocalSummary, loadAuditLogs]);

  return {
    config,
    setConfig,
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
    loadConfig,
    saveConfig,
    testConnection,
    inspectTables,
    loadLocalSummary,
    loadAuditLogs,
    startSyncUp,
    startSyncDown,
  };
}
