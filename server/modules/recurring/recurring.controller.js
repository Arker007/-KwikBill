import { recurringService } from './recurring.service.js';

export class RecurringController {
  /**
   * @param {import('./recurring.service.js').RecurringService} [service]
   */
  constructor(service) {
    this.service = service || recurringService;
  }

  list = (req, res, next) => {
    try {
      const items = this.service.listRecurring();
      res.json(items);
    } catch (err) {
      next(err);
    }
  };

  getById = (req, res, next) => {
    try {
      const item = this.service.getRecurring(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'not-found', message: 'Recurring template not found' });
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  };

  save = (req, res, next) => {
    try {
      const result = this.service.saveRecurring(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  delete = (req, res, next) => {
    try {
      const result = this.service.deleteRecurring(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const recurringController = new RecurringController();
