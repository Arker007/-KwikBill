import type { Request, Response, NextFunction } from 'express';
import { recurringService, RecurringService } from './recurring.service.ts';

export class RecurringController {
  private service: RecurringService;

  constructor(service?: RecurringService) {
    this.service = service || recurringService;
  }

  list = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const items = this.service.listRecurring();
      res.json(items);
    } catch (err) {
      next(err);
    }
  };

  getById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const item = this.service.getRecurring(req.params.id);
      if (!item) {
        res.status(404).json({ error: 'not-found', message: 'Recurring template not found' });
        return;
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  };

  save = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.saveRecurring(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  delete = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.deleteRecurring(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const recurringController = new RecurringController();
