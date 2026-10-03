import { Router } from 'express';
import { supabaseController } from './supabase.controller.ts';

export const supabaseRouter: Router = Router();

// /api/supabase/config
supabaseRouter.get('/config', supabaseController.getConfig);
supabaseRouter.post('/config', supabaseController.saveConfig);

// /api/supabase/test
supabaseRouter.post('/test', supabaseController.testConnection);

// /api/supabase/tables
supabaseRouter.get('/tables', supabaseController.checkTables);

// /api/supabase/local-summary
supabaseRouter.get('/local-summary', supabaseController.getLocalSummary);

// /api/supabase/sync-up
supabaseRouter.post('/sync-up', supabaseController.syncUp);

// /api/supabase/sync-down
supabaseRouter.post('/sync-down', supabaseController.syncDown);

// /api/supabase/audit-log
supabaseRouter.get('/audit-log', supabaseController.getAuditLogs);
