import { billsService } from './bills.service.js';

export class BillsController {
  constructor(service = billsService) {
    this.service = service;
  }

  getBills = (req, res, next) => {
    try {
      const bills = this.service.listBills();
      res.json(bills);
    } catch (err) {
      next(err);
    }
  };

  getBill = (req, res, next) => {
    try {
      const bill = this.service.getBill(req.params.id);
      if (!bill) {
        return res.status(404).json({ error: 'Bill not found' });
      }
      res.json(bill);
    } catch (err) {
      next(err);
    }
  };

  saveBill = (req, res, next) => {
    try {
      const bill = req.body;
      const overwrite = req.query.overwrite === '1' || req.query.overwrite === 'true';
      const result = this.service.saveBill(bill, { overwrite });
      res.json(result);
    } catch (err) {
      if (err.statusCode === 400) {
        return res.status(400).json({ error: err.message });
      }
      if (err.statusCode === 409) {
        return res.status(409).json({
          error: err.message,
          invoiceNumber: err.invoiceNumber,
        });
      }
      next(err);
    }
  };

  deleteBill = (req, res, next) => {
    try {
      const force = req.query.force === '1' || req.query.force === 'true';
      const permanent = req.query.permanent === '1' || req.query.permanent === 'true';
      const result = this.service.deleteBill(req.params.id, { force, permanent });
      res.json(result);
    } catch (err) {
      if (err.statusCode === 409 && err.error === 'client-credit-dependency') {
        return res.status(409).json({
          error: 'client-credit-dependency',
          message: err.message,
          dependents: err.dependents,
        });
      }
      next(err);
    }
  };
}

export const billsController = new BillsController();
