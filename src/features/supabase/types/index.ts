export type SupabaseConnectionStatus = 'disconnected' | 'testing' | 'connected' | 'error';

export interface SupabaseConfigState {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;
  autoSyncOnSave: boolean;
  conflictStrategy: 'local_wins' | 'cloud_wins';
  configured: boolean;
  hasAnonKey: boolean;
  hasServiceKey: boolean;
}

export interface SupabaseTableStatus {
  name: string;
  label: string;
  exists: boolean;
  required: boolean;
}

export interface LocalSummaryData {
  ok: boolean;
  total: number;
  counts: {
    bills: number;
    clients: number;
    products: number;
    expenses: number;
    purchases: number;
    receipts: number;
    recurring: number;
    businessProfiles: number;
  };
}

export interface SyncAuditItem {
  id: string;
  syncType: 'sync_up' | 'sync_down' | 'export_all';
  recordsCount: number;
  collectionsSynced?: Record<string, number>;
  status: 'success' | 'failed' | 'partial';
  errorMessage?: string;
  snapshotCreated?: string;
  durationMs?: number;
  timestamp: string;
  triggeredBy?: string;
}

export interface SyncOperationState {
  inProgress: boolean;
  type: 'upload' | 'download' | null;
  progressPercent: number;
  currentCollection?: string;
  error?: string | null;
  lastResult?: {
    ok: boolean;
    totalSynced?: number;
    durationMs?: number;
    snapshotCreated?: string;
    summary?: any;
  } | null;
}
