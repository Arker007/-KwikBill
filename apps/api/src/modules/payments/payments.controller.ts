import type { Request, Response, NextFunction } from 'express';
import { paymentsService, PaymentsService } from './payments.service.ts';

export class PaymentsController {
  private service: PaymentsService;

  constructor(service?: PaymentsService) {
    this.service = service || paymentsService;
  }

  getReceipts = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const receipts = this.service.listReceipts();
      res.json(receipts);
    } catch (err) {
      next(err);
    }
  };

  getReceipt = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const receipt = this.service.getReceipt(req.params.id);
      if (!receipt) {
        res.status(404).json({ error: 'Receipt not found' });
        return;
      }
      res.json(receipt);
    } catch (err) {
      next(err);
    }
  };

  saveReceipt = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.saveReceipt(req.body);
      res.json(result);
    } catch (err: any) {
      if (err.statusCode === 400) {
        res.status(400).json({ error: err.message });
        return;
      }
      next(err);
    }
  };

  deleteReceipt = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.deleteReceipt(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const paymentsController = new PaymentsController();
export const receiptsController = paymentsController;
