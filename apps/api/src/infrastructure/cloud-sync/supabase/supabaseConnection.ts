export const REQUIRED_TABLES: string[] = [
  'bills',
  'clients',
  'products',
  'expenses',
  'purchases',
  'receipts',
  'recurring',
  'business_profiles'
];

export interface TestConnectionResult {
  ok: boolean;
  latencyMs: number;
  status: number;
  message?: string;
  tablesInitialized?: boolean;
  error?: string;
  details?: any;
}

export interface CheckTablesResult {
  ok: boolean;
  tables: Record<string, { exists: boolean; reason?: string }>;
  existingCount: number;
  totalCount: number;
  allExist: boolean;
}

/**
 * Tests connectivity against Supabase instance.
 */
export async function testSupabaseConnection(client: any): Promise<TestConnectionResult> {
  const start = Date.now();
  try {
    const { error, status } = await client
      .from('bills')
      .select('id', { count: 'exact', head: true });

    const latencyMs = Date.now() - start;

    if (error) {
      const errMsg = (error.message || '').toLowerCase();
      if (
        error.code === '42P01' ||
        error.code === 'PGRST204' ||
        error.code === 'PGRST205' ||
        errMsg.includes('could not find the table') ||
        errMsg.includes('schema cache') ||
        errMsg.includes('does not exist') ||
        (status === 404 && errMsg.includes('not found'))
      ) {
        return {
          ok: true,
          latencyMs,
          status: 200,
          message: 'Connected to Supabase successfully. Database reachable (tables pending schema setup).',
          tablesInitialized: false
        };
      }

      if (
        status === 401 ||
        status === 403 ||
        error.code === 'PGRST301' ||
        errMsg.includes('jwt') ||
        errMsg.includes('invalid request') ||
        errMsg.includes('api key') ||
        errMsg.includes('unauthorized')
      ) {
        return {
          ok: false,
          latencyMs,
          status: status || 401,
          error: 'Authentication failed: Invalid API Key or URL. Please verify your Project URL and copy the Anon/Public Key from Supabase Dashboard > Project Settings > API.',
          details: error.message
        };
      }

      return {
        ok: false,
        latencyMs,
        status: status || 500,
        error: error.message || 'Supabase query failed',
        details: error
      };
    }

    return {
      ok: true,
      latencyMs,
      status: status || 200,
      message: 'Connected to Supabase successfully. Database reachable and tables detected.',
      tablesInitialized: true
    };
  } catch (err: any) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      status: err?.statusCode || 400,
      error: err?.message || 'Failed to establish connection to Supabase endpoint.'
    };
  }
}

/**
 * Checks existence of required tables.
 */
export async function checkSupabaseTables(client: any): Promise<CheckTablesResult> {
  const tableReport: Record<string, { exists: boolean; reason?: string }> = {};
  let existingCount = 0;

  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await client
        .from(table)
        .select('id', { count: 'exact', head: true });

      const errMsg = (error?.message || '').toLowerCase();
      if (!error) {
        tableReport[table] = { exists: true };
        existingCount++;
      } else if (
        error.code === '42P01' ||
        error.code === 'PGRST204' ||
        error.code === 'PGRST205' ||
        errMsg.includes('could not find the table') ||
        errMsg.includes('schema cache') ||
        errMsg.includes('does not exist')
      ) {
        tableReport[table] = { exists: false, reason: 'Table not yet created in Supabase' };
      } else {
        tableReport[table] = { exists: false, reason: error.message };
      }
    } catch (err: any) {
      tableReport[table] = { exists: false, reason: err?.message || String(err) };
    }
  }

  return {
    ok: true,
    tables: tableReport,
    existingCount,
    totalCount: REQUIRED_TABLES.length,
    allExist: existingCount === REQUIRED_TABLES.length
  };
}
