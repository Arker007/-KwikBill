import type { Request, Response, NextFunction } from 'express';
import { documentsService, DocumentsService } from './documents.service.ts';

export class DocumentsController {
  private service: DocumentsService;

  constructor(service?: DocumentsService) {
    this.service = service || documentsService;
  }

  getTemplates = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const templates = this.service.listTemplates();
      res.json(templates);
    } catch (err) {
      next(err);
    }
  };

  getTemplate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const template = this.service.getTemplate(req.params.id);
      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }
      res.json(template);
    } catch (err) {
      next(err);
    }
  };

  saveTemplate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.saveTemplate(req.body);
      res.json(result);
    } catch (err: any) {
      if (err.statusCode === 400) {
        res.status(400).json({ error: err.message });
        return;
      }
      next(err);
    }
  };

  deleteTemplate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.deleteTemplate(req.params.id);
      res.json(result);
    } catch (err: any) {
      if (err.statusCode === 400) {
        res.status(400).json({ error: err.message });
        return;
      }
      next(err);
    }
  };
}

export const documentsController = new DocumentsController();
export const templatesController = documentsController;
