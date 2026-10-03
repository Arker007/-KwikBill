import { purchasesService } from './purchases.service.js';

export class PurchasesController {
  constructor(service = purchasesService) {
    this.service = service;
  }

  getPurchases = (req, res, next) => {
    try {
      const purchases = this.service.listPurchases();
      res.json(purchases);
    } catch (err) {
      next(err);
    }
  };

  getPurchase = (req, res, next) => {
    try {
      const purchase = this.service.getPurchase(req.params.id);
      if (!purchase) {
        return res.status(404).json({ error: 'Purchase not found' });
      }
      res.json(purchase);
    } catch (err) {
      next(err);
    }
  };

  savePurchase = (req, res, next) => {
    try {
      const result = this.service.savePurchase(req.body);
      res.json(result);
    } catch (err) {
      if (err.statusCode === 400) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  };

  deletePurchase = (req, res, next) => {
    try {
      const result = this.service.deletePurchase(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const purchasesController = new PurchasesController();
