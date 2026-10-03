import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../../../config/paths.ts';
import { readJsonSafe, writeJsonAtomic } from '../../../../../../server/shared/utils/atomicFs.js';
import { safeFileName } from '../../../../../../server/shared/utils/pathUtils.js';
import { ensureDir, createSnapshotBeforeSync } from '../../backups/index.ts';
import { SupabaseTransformers } from './supabase.transformers.ts';
import { invoicingService } from '../../../modules/invoicing/invoicing.service.ts';

export { createSnapshotBeforeSync };

const BATCH_SIZE = 50;

export const SYNC_COLLECTIONS_ORDER = [
  'business_profiles',
  'clients',
  'products',
  'bills',
  'expenses',
  'purchases',
  'receipts',
  'recurring'
];

/**
 * Reads all JSON files from a collection directory.
 */
function readLocalCollection(dirName: string): any[] {
  const p = path.join(DATA_DIR, dirName);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p)
    .filter(f => f.endsWith('.json'))
    .map(f => readJsonSafe(path.join(p, f), null))
    .filter(Boolean);
}

export class SupabaseSyncService {
  /**
   * Reads all local entities across the 8 collections.
   */
  readAllLocalData(): Record<string, any[]> {
    // Primary profile + secondary profiles
    const primary = readJsonSafe(path.join(DATA_DIR, 'profile.json'), null);
    const secondaryProfiles = readLocalCollection('profiles');
    const businessProfiles: any[] = [];
    if (primary) {
      businessProfiles.push({ id: 'primary', ...primary });
    }
    for (const prof of secondaryProfiles) {
      if (prof?.id && prof.id !== 'primary') {
        businessProfiles.push(prof);
      }
    }

    return {
      business_profiles: businessProfiles,
      clients: readLocalCollection('clients'),
      products: readLocalCollection('products'),
      bills: readLocalCollection('bills'),
      expenses: readLocalCollection('expenses'),
      purchases: readLocalCollection('purchases'),
      receipts: readLocalCollection('receipts'),
      recurring: readLocalCollection('recurring')
    };
  }

  /**
   * Performs batched upload of local data to Supabase.
   */
  async syncUp(client: any, options: { triggeredBy?: string } = {}): Promise<any> {
    const startTime = Date.now();
    const localData = this.readAllLocalData();
    const collectionReports: Record<string, any> = {};
    let totalUploaded = 0;
    let totalFailed = 0;
    const tableErrors: string[] = [];

    for (const colName of SYNC_COLLECTIONS_ORDER) {
      const transformer = SupabaseTransformers[colName];
      const items = localData[colName] || [];
      const colReport: { total: number; uploaded: number; failed: number; errors: string[] } = {
        total: items.length,
        uploaded: 0,
        failed: 0,
        errors: []
      };

      if (!items.length) {
        collectionReports[colName] = colReport;
        continue;
      }

      // Chunk into batches of BATCH_SIZE (50)
      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const mappedBatch = batch
          .map(item => transformer.toRemote(item))
          .filter(Boolean);

        if (!mappedBatch.length) continue;

        try {
          const { error } = await client
            .from(colName)
            .upsert(mappedBatch, { onConflict: 'id' });

          if (error) {
            // Check if error is due to foreign key constraint (e.g., client_id or bill_id)
            if (error.code === '23503' || (error.message && error.message.includes('foreign key'))) {
              // Retry batch with foreign keys nulled out to preserve data
              const fallbackBatch = mappedBatch.map(row => {
                const copy = { ...row };
                if ('client_id' in copy) copy.client_id = null;
                if ('bill_id' in copy) copy.bill_id = null;
                return copy;
              });

              const retry = await client
                .from(colName)
                .upsert(fallbackBatch, { onConflict: 'id' });

              if (!retry.error) {
                colReport.uploaded += batch.length;
                totalUploaded += batch.length;
                continue;
              }
            }

            colReport.failed += batch.length;
            const msg = error.message || 'Unknown Supabase error';
            colReport.errors.push(msg);
            tableErrors.push(`[${colName}] ${msg}`);
          } else {
            colReport.uploaded += batch.length;
            totalUploaded += batch.length;
          }
        } catch (err: any) {
          colReport.failed += batch.length;
          const msg = err?.message || 'Unknown network error';
          colReport.errors.push(msg);
          tableErrors.push(`[${colName}] ${msg}`);
        }
      }

      totalFailed += colReport.failed;
      collectionReports[colName] = colReport;
    }

    const durationMs = Date.now() - startTime;
    const overallStatus = totalFailed === 0 ? 'success' : totalUploaded > 0 ? 'partial' : 'failed';

    // Formulate actionable error message if any failures occurred
    let topLevelError: string | null = null;
    if (overallStatus === 'failed') {
      const hasMissingTable = tableErrors.some(e => {
        const lower = String(e || '').toLowerCase();
        return (
          lower.includes('does not exist') ||
          lower.includes('42p01') ||
          lower.includes('pgrst205') ||
          lower.includes('pgrst204') ||
          lower.includes('could not find the table') ||
          lower.includes('schema cache')
        );
      });
      const hasRlsError = tableErrors.some(e => {
        const lower = String(e || '').toLowerCase();
        return lower.includes('row-level security') || lower.includes('42501') || lower.includes('permission denied');
      });

      if (hasMissingTable) {
        topLevelError =
          'Supabase database tables are not yet created. Please copy the SQL Schema script below, open your Supabase SQL Editor (SQL Editor > New Query), paste it, and click "Run" to initialize all 9 tables.';
      } else if (hasRlsError) {
        topLevelError =
          'Upload blocked by Supabase Row Level Security (RLS) policies. Please run the SQL schema script in your Supabase SQL Editor to enable public access policies.';
      } else {
        topLevelError = `Sync-up failed: ${tableErrors.slice(0, 3).join('; ')}`;
      }
    }

    // Record audit telemetry
    await this.recordAuditLog(client, {
      sync_type: 'sync_up',
      records_count: totalUploaded,
      collections_synced: collectionReports,
      status: overallStatus,
      error_message: topLevelError,
      triggered_by: options.triggeredBy || 'user'
    });

    return {
      ok: overallStatus !== 'failed',
      status: overallStatus,
      error: topLevelError,
      durationMs,
      summary: {
        totalLocalRecords: Object.values(localData).reduce((sum, arr) => sum + arr.length, 0),
        totalUploaded,
        totalFailed,
        collections: collectionReports
      }
    };
  }

  /**
   * Fetches remote Supabase tables and safely writes to local disk with snapshot protection.
   */
  async syncDown(client: any, options: { conflictStrategy?: 'local_wins' | 'cloud_wins'; triggeredBy?: string } = {}): Promise<any> {
    const startTime = Date.now();
    const conflictStrategy = options.conflictStrategy || 'local_wins';

    // Quality gate: snapshot before modifying any local file
    const snapshotName = createSnapshotBeforeSync();

    const collectionReports: Record<string, any> = {};
    let totalDownloaded = 0;
    let totalWritten = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    for (const colName of SYNC_COLLECTIONS_ORDER) {
      const transformer = SupabaseTransformers[colName];
      const colReport: { downloaded: number; written: number; skipped: number; failed: number; errors: string[] } = {
        downloaded: 0,
        written: 0,
        skipped: 0,
        failed: 0,
        errors: []
      };
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        try {
          const { data, error } = await client
            .from(colName)
            .select('*')
            .range(offset, offset + BATCH_SIZE - 1);

          if (error) {
            colReport.errors.push(error.message);
            colReport.failed++;
            break;
          }

          if (!data || data.length === 0) {
            hasMore = false;
            break;
          }

          colReport.downloaded += data.length;
          totalDownloaded += data.length;

          // Merge each record locally
          for (const remoteRow of data) {
            const localDoc = transformer.toLocal(remoteRow);
            if (!localDoc || !localDoc.id) continue;

            const safeId = safeFileName(localDoc.id);

            if (colName === 'business_profiles') {
              if (localDoc.id === 'primary') {
                const target = path.join(DATA_DIR, 'profile.json');
                const exists = fs.existsSync(target);
                if (exists && conflictStrategy === 'local_wins') {
                  colReport.skipped++;
                  totalSkipped++;
                } else {
                  writeJsonAtomic(target, localDoc);
                  colReport.written++;
                  totalWritten++;
                }
              } else {
                ensureDir(path.join(DATA_DIR, 'profiles'));
                const target = path.join(DATA_DIR, 'profiles', `${safeId}.json`);
                const exists = fs.existsSync(target);
                if (exists && conflictStrategy === 'local_wins') {
                  colReport.skipped++;
                  totalSkipped++;
                } else {
                  writeJsonAtomic(target, localDoc);
                  colReport.written++;
                  totalWritten++;
                }
              }
            } else {
              const targetDir = path.join(DATA_DIR, colName);
              ensureDir(targetDir);
              const target = path.join(targetDir, `${safeId}.json`);
              const exists = fs.existsSync(target);

              if (exists && conflictStrategy === 'local_wins') {
                colReport.skipped++;
                totalSkipped++;
              } else {
                writeJsonAtomic(target, localDoc);
                colReport.written++;
                totalWritten++;
              }
            }
          }

          if (data.length < BATCH_SIZE) {
            hasMore = false;
          } else {
            offset += BATCH_SIZE;
          }
        } catch (err: any) {
          colReport.errors.push(err?.message || String(err));
          colReport.failed++;
          hasMore = false;
        }
      }

      collectionReports[colName] = colReport;
    }

    // Invalidate in-memory bill cache so UI reflects freshly synced bills immediately
    try {
      invoicingService.invalidateCache();
    } catch {
      /* ignore */
    }

    const durationMs = Date.now() - startTime;
    const overallStatus = totalFailed === 0 ? 'success' : totalDownloaded > 0 ? 'partial' : 'failed';

    let topLevelError: string | null = null;
    if (overallStatus === 'failed') {
      const allErrors = Object.entries(collectionReports)
        .filter(([, rep]) => rep.errors && rep.errors.length > 0)
        .map(([col, rep]) => `[${col}] ${rep.errors[0]}`);

      const hasMissingTable = allErrors.some(e => {
        const lower = String(e || '').toLowerCase();
        return (
          lower.includes('does not exist') ||
          lower.includes('42p01') ||
          lower.includes('pgrst205') ||
          lower.includes('pgrst204') ||
          lower.includes('could not find the table') ||
          lower.includes('schema cache')
        );
      });

      if (hasMissingTable) {
        topLevelError =
          'Supabase database tables are not yet created. Please copy the SQL Schema script below, open your Supabase SQL Editor (SQL Editor > New Query), paste it, and click "Run" to initialize all 9 tables.';
      } else {
        topLevelError = `Sync-down failed: ${allErrors.slice(0, 3).join('; ') || 'Unable to download records'}`;
      }
    }

    // Record audit telemetry
    await this.recordAuditLog(client, {
      sync_type: 'sync_down',
      records_count: totalWritten,
      collections_synced: collectionReports,
      status: overallStatus,
      error_message: topLevelError,
      triggered_by: options.triggeredBy || 'user'
    });

    return {
      ok: overallStatus !== 'failed',
      status: overallStatus,
      error: topLevelError,
      snapshotCreated: snapshotName,
      conflictStrategy,
      durationMs,
      summary: {
        totalDownloaded,
        totalWritten,
        totalSkipped,
        collections: collectionReports
      }
    };
  }

  /**
   * Records synchronization audit telemetry both locally and in Supabase.
   */
  async recordAuditLog(client: any, payload: any): Promise<void> {
    const logItem = {
      ...payload,
      timestamp: new Date().toISOString()
    };

    // Save to local log in ./data/supabase_sync_log.json
    try {
      const localLogPath = path.join(DATA_DIR, 'supabase_sync_log.json');
      const existing = readJsonSafe(localLogPath, []);
      const updated = [logItem, ...existing].slice(0, 50);
      writeJsonAtomic(localLogPath, updated);
    } catch {
      // Ignore local logging error
    }

    // Save to Supabase sync_audit_log if table exists
    try {
      if (client) {
        await client.from('sync_audit_log').insert([logItem]);
      }
    } catch {
      // Ignore remote audit logging error if table not yet created
    }
  }

  /**
   * Retrieves audit logs from local cache or remote table.
   */
  async getAuditLogs(client?: any): Promise<any[]> {
    if (client) {
      try {
        const { data, error } = await client
          .from('sync_audit_log')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(30);

        if (!error && Array.isArray(data) && data.length > 0) {
          return data;
        }
      } catch {
        // Fallback to local
      }
    }

    const localLogPath = path.join(DATA_DIR, 'supabase_sync_log.json');
    return readJsonSafe(localLogPath, []);
  }
}

export const supabaseSyncService = new SupabaseSyncService();
