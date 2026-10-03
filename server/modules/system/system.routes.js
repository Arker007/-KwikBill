import { Router } from 'express';
import express from 'express';
import { SystemController } from './system.controller.js';

export const systemRouter = Router();

// /api/health
systemRouter.get('/health', SystemController.healthCheck);

// /api/save-pdf
systemRouter.post('/save-pdf', express.raw({ type: 'application/pdf', limit: '20mb' }), SystemController.savePdf);

// /api/version
systemRouter.get('/version', SystemController.getVersion);

// /api/check-update
systemRouter.get('/check-update', SystemController.checkUpdate);

// /api/control-panel/status
systemRouter.get('/control-panel/status', SystemController.controlPanelStatus);

// /api/control-panel/backup
systemRouter.post('/control-panel/backup', SystemController.controlPanelBackup);

// /api/control-panel/open-data-folder
systemRouter.post('/control-panel/open-data-folder', SystemController.controlPanelOpenData);

// /api/control-panel/open-backups-folder
systemRouter.post('/control-panel/open-backups-folder', SystemController.controlPanelOpenBackups);

// /api/control-panel/launch-script
systemRouter.post('/control-panel/launch-script', SystemController.controlPanelLaunchScript);
