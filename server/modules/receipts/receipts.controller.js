import { receiptsService } from './receipts.service.js';

export class ReceiptsController {
  constructor(service = receiptsService) {
    this.service = service;
  }

  getReceipts = (req, res, next) => {
    try {
      const receipts = this.service.listReceipts();
      res.json(receipts);
    } catch (err) {
      next(err);
    }
  };

  getReceipt = (req, res, next) => {
    try {
      const receipt = this.service.getReceipt(req.params.id);
      if (!receipt) {
        return res.status(404).json({ error: 'Receipt not found' });
      }
      res.json(receipt);
    } catch (err) {
      next(err);
    }
  };

  saveReceipt = (req, res, next) => {
    try {
      const result = this.service.saveReceipt(req.body);
      res.json(result);
    } catch (err) {
      if (err.statusCode === 400) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  };

  deleteReceipt = (req, res, next) => {
    try {
      const result = this.service.deleteReceipt(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const receiptsController = new ReceiptsController();
