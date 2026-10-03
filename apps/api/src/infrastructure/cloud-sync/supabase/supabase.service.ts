import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG_FILE } from '../../../config/paths.ts';
import { SingleFileRepository } from '../../persistence/SingleFileRepository.ts';
import { BadRequestError } from '../../../platform/errors/AppError.ts';
import { supabaseSyncService } from './supabaseSync.service.ts';
import { REQUIRED_TABLES, testSupabaseConnection, checkSupabaseTables } from './supabaseConnection.ts';

export { REQUIRED_TABLES };

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  autoSync: boolean;
  conflictStrategy: 'local_wins' | 'cloud_wins';
  lastSyncAt: string | null;
}

const DEFAULT_CONFIG: SupabaseConfig = {
  url: '',
  anonKey: '',
  serviceRoleKey: '',
  autoSync: false,
  conflictStrategy: 'local_wins',
  lastSyncAt: null
};

/**
 * Masks an API key for safe client display.
 */
function maskKey(key?: string): string {
  if (!key || typeof key !== 'string') return '';
  const trimmed = key.trim();
  if (trimmed.length <= 10) return '••••••••';
  return `${trimmed.slice(0, 6)}••••••••${trimmed.slice(-4)}`;
}

export class SupabaseService {
  private repo: SingleFileRepository<SupabaseConfig>;

  constructor(configRepo?: SingleFileRepository<SupabaseConfig>) {
    this.repo = configRepo || new SingleFileRepository<SupabaseConfig>(SUPABASE_CONFIG_FILE, DEFAULT_CONFIG);
  }

  /**
   * Retrieves stored configuration with masked secrets.
   */
  async getConfig(): Promise<any> {
    const raw = await this.repo.getAsync(DEFAULT_CONFIG);
    const url = raw.url ? String(raw.url).trim() : '';
    const anonKey = raw.anonKey ? String(raw.anonKey).trim() : '';
    const serviceRoleKey = raw.serviceRoleKey ? String(raw.serviceRoleKey).trim() : '';

    return {
      url,
      anonKeyMasked: maskKey(anonKey),
      serviceRoleKeyMasked: maskKey(serviceRoleKey),
      hasAnonKey: Boolean(anonKey),
      hasServiceRoleKey: Boolean(serviceRoleKey),
      autoSync: Boolean(raw.autoSync),
      conflictStrategy: raw.conflictStrategy || 'local_wins',
      lastSyncAt: raw.lastSyncAt || null,
      isConfigured: Boolean(url && (anonKey || serviceRoleKey)),

      // Frontend compatibility mappings
      supabaseUrl: url,
      supabaseAnonKey: maskKey(anonKey),
      supabaseServiceKey: maskKey(serviceRoleKey),
      hasServiceKey: Boolean(serviceRoleKey),
      autoSyncOnSave: Boolean(raw.autoSync),
      configured: Boolean(url && (anonKey || serviceRoleKey))
    };
  }

  /**
   * Saves or updates Supabase connection settings.
   * Preserves existing keys if client provides masked placeholders.
   * Accepts both backend and frontend parameter naming conventions.
   */
  async saveConfig(input: any = {}): Promise<any> {
    const current = await this.repo.getAsync(DEFAULT_CONFIG);
    const url = input.url !== undefined ? input.url : input.supabaseUrl;
    const anonKey = input.anonKey !== undefined ? input.anonKey : input.supabaseAnonKey;
    const serviceRoleKey = input.serviceRoleKey !== undefined 
      ? input.serviceRoleKey 
      : (input.serviceKey !== undefined ? input.serviceKey : input.supabaseServiceKey);
    const autoSync = input.autoSync !== undefined ? input.autoSync : input.autoSyncOnSave;
    const conflictStrategy = input.conflictStrategy;

    // Validate and clean URL
    if (url !== undefined) {
      let cleanUrl = String(url || '').trim().replace(/\/+$/, '');
      if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = `https://${cleanUrl}`;
      }
      current.url = cleanUrl;
    }

    // Preserve existing anon key if masked or omitted
    if (anonKey !== undefined) {
      const cleanAnon = String(anonKey || '').trim();
      if (cleanAnon && !cleanAnon.includes('••••')) {
        current.anonKey = cleanAnon;
      } else if (cleanAnon === '') {
        current.anonKey = '';
      }
    }

    // Preserve existing service role key if masked or omitted
    if (serviceRoleKey !== undefined) {
      const cleanService = String(serviceRoleKey || '').trim();
      if (cleanService && !cleanService.includes('••••')) {
        current.serviceRoleKey = cleanService;
      } else if (cleanService === '') {
        current.serviceRoleKey = '';
      }
    }

    if (autoSync !== undefined) {
      current.autoSync = Boolean(autoSync);
    }

    if (conflictStrategy !== undefined) {
      current.conflictStrategy = conflictStrategy === 'cloud_wins' ? 'cloud_wins' : 'local_wins';
    }

    if (input.lastSyncAt !== undefined) {
      current.lastSyncAt = input.lastSyncAt;
    }

    await this.repo.setAsync(current);
    return await this.getConfig();
  }

  /**
   * Instantiates a Supabase client using stored or explicit credentials.
   * Robustly supports both legacy JWT keys and new opaque sb_publishable_ / sb_secret_ keys.
   */
  async getClient(customCredentials: any = null): Promise<any> {
    const raw = await this.repo.getAsync(DEFAULT_CONFIG);
    const rawUrl = customCredentials?.url || customCredentials?.supabaseUrl || raw.url || process.env.SUPABASE_URL || '';
    let url = String(rawUrl).trim().replace(/\/+$/, '');
    if (url && !/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    
    // Choose active key: prefer explicit key, then serviceRoleKey, then anonKey, then environment variables
    let key = '';
    if (customCredentials?.key) {
      key = String(customCredentials.key).trim();
    } else if (customCredentials?.anonKey) {
      key = String(customCredentials.anonKey).trim();
    } else if (customCredentials?.supabaseAnonKey) {
      key = String(customCredentials.supabaseAnonKey).trim();
    } else if (customCredentials?.serviceRoleKey) {
      key = String(customCredentials.serviceRoleKey).trim();
    } else if (customCredentials?.supabaseServiceKey) {
      key = String(customCredentials.supabaseServiceKey).trim();
    } else if (raw.serviceRoleKey) {
      key = String(raw.serviceRoleKey).trim();
    } else if (raw.anonKey) {
      key = String(raw.anonKey).trim();
    } else if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      key = String(process.env.SUPABASE_SERVICE_ROLE_KEY).trim();
    } else if (process.env.SUPABASE_ANON_KEY) {
      key = String(process.env.SUPABASE_ANON_KEY).trim();
    }

    if (!url) {
      throw new BadRequestError('Supabase Project URL is not configured. Please provide your Supabase URL (e.g. https://xyzcompany.supabase.co).');
    }
    if (!key) {
      throw new BadRequestError('Supabase API Key is not configured. Please provide your publishable (anon) or secret key.');
    }

    return createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      global: {
        fetch: async (input: any, init: any) => {
          const headers = new Headers(init?.headers);
          const auth = headers.get('authorization') || headers.get('Authorization');
          // Fix for @supabase/supabase-js library issue where new-format API keys
          // (sb_publishable_... or sb_secret_...) are erroneously set as Bearer tokens.
          if (auth && (auth.startsWith('Bearer sb_') || !auth.slice(7).includes('.'))) {
            headers.delete('authorization');
            headers.delete('Authorization');
          }
          return fetch(input, { ...init, headers });
        }
      }
    });
  }

  /**
   * Tests connectivity, measuring roundtrip latency and credential validity.
   */
  async testConnection(credentials: any = null): Promise<any> {
    const client = await this.getClient(credentials);
    return await testSupabaseConnection(client);
  }

  /**
   * Checks existence of all required application tables in the Supabase instance.
   */
  async checkTables(credentials: any = null): Promise<any> {
    const client = await this.getClient(credentials);
    return await checkSupabaseTables(client);
  }

  /**
   * Uploads all local records across 8 collections to Supabase in batches of 50.
   */
  async syncUp(options: any = {}): Promise<any> {
    const client = await this.getClient();
    const result = await supabaseSyncService.syncUp(client, options);
    if (result.ok) {
      await this.saveConfig({ lastSyncAt: new Date().toISOString() });
    }
    return result;
  }

  /**
   * Downloads remote records from Supabase, creates a rollback backup, and merges into local storage.
   */
  async syncDown(options: any = {}): Promise<any> {
    const raw = await this.repo.getAsync(DEFAULT_CONFIG);
    const client = await this.getClient();
    const conflictStrategy = options.conflictStrategy || raw.conflictStrategy || 'local_wins';
    const result = await supabaseSyncService.syncDown(client, { ...options, conflictStrategy });
    if (result.ok) {
      await this.saveConfig({ lastSyncAt: new Date().toISOString() });
    }
    return result;
  }

  /**
   * Retrieves synchronization audit history logs.
   */
  async getAuditLogs(): Promise<any[]> {
    let client: any = null;
    try {
      client = await this.getClient();
    } catch {
      // Unconfigured or network offline: fallback to local audit logs
    }
    return await supabaseSyncService.getAuditLogs(client);
  }

  /**
   * Returns counts of local records ready for synchronization.
   */
  getLocalSummary(): any {
    const data = supabaseSyncService.readAllLocalData();
    const counts: Record<string, number> = {};
    let total = 0;
    for (const [key, items] of Object.entries(data)) {
      counts[key] = items.length;
      total += items.length;
    }
    return { ok: true, total, counts };
  }
}

export const supabaseService = new SupabaseService();
