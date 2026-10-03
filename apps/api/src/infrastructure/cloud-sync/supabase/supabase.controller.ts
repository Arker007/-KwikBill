import type { Request, Response, NextFunction } from 'express';
import { supabaseService, SupabaseService } from './supabase.service.ts';

export class SupabaseController {
  private service: SupabaseService;

  constructor(service: SupabaseService = supabaseService) {
    this.service = service;
  }

  getConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = await this.service.getConfig();
      res.json(config);
    } catch (err) {
      next(err);
    }
  };

  saveConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.service.saveConfig(req.body || {});
      res.json({ ok: true, message: 'Configuration saved successfully', ...updated, config: updated });
    } catch (err) {
      next(err);
    }
  };

  testConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.testConnection(req.body || null);
      res.json(result);
    } catch (err: any) {
      res.status(200).json({
        ok: false,
        status: err.statusCode || 400,
        error: err.message || 'Failed to establish connection to Supabase.',
        details: err.message
      });
    }
  };

  checkTables = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.checkTables(req.query || null);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  syncUp = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.syncUp(req.body || {});
      res.json(result);
    } catch (err: any) {
      res.status(200).json({
        ok: false,
        status: 'failed',
        error: err.message || 'Synchronization failed',
        details: err.message
      });
    }
  };

  syncDown = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.syncDown(req.body || {});
      res.json(result);
    } catch (err: any) {
      res.status(200).json({
        ok: false,
        status: 'failed',
        error: err.message || 'Synchronization failed',
        details: err.message
      });
    }
  };

  getLocalSummary = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.getLocalSummary();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getAuditLogs();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const supabaseController = new SupabaseController();
