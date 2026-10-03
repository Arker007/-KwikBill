import type { Request, Response, NextFunction } from 'express';
import { purchasingService, PurchasingService } from './purchasing.service.ts';

export class PurchasingController {
  private service: PurchasingService;

  constructor(service?: PurchasingService) {
    this.service = service || purchasingService;
  }

  getPurchases = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const purchases = this.service.listPurchases();
      res.json(purchases);
    } catch (err) {
      next(err);
    }
  };

  getPurchase = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const purchase = this.service.getPurchase(req.params.id);
      if (!purchase) {
        res.status(404).json({ error: 'Purchase not found' });
        return;
      }
      res.json(purchase);
    } catch (err) {
      next(err);
    }
  };

  savePurchase = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.savePurchase(req.body);
      res.json(result);
    } catch (err: any) {
      if (err.statusCode === 400) {
        res.status(400).json({ error: err.message });
        return;
      }
      next(err);
    }
  };

  deletePurchase = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.deletePurchase(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const purchasingController = new PurchasingController();
export const purchasesController = purchasingController;
