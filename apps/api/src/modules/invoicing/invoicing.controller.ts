import type { Request, Response, NextFunction } from 'express';
import { InvoicingService, invoicingService } from './invoicing.service.ts';

export class InvoicingController {
  private service: InvoicingService;

  constructor(service?: InvoicingService) {
    this.service = service || invoicingService;
  }

  getBills = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const bills = this.service.listBills();
      res.json(bills);
    } catch (err) {
      next(err);
    }
  };

  getInvoices = this.getBills;

  getBill = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const bill = this.service.getBill(req.params.id);
      if (!bill) {
        res.status(404).json({ error: 'Bill not found' });
        return;
      }
      res.json(bill);
    } catch (err) {
      next(err);
    }
  };

  getInvoice = this.getBill;

  saveBill = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const bill = req.body;
      const overwrite = req.query.overwrite === '1' || req.query.overwrite === 'true';
      const result = this.service.saveBill(bill, { overwrite });
      res.json(result);
    } catch (err: any) {
      if (err.statusCode === 400) {
        res.status(400).json({ error: err.message });
        return;
      }
      if (err.statusCode === 409) {
        res.status(409).json({
          error: err.message,
          invoiceNumber: err.invoiceNumber,
        });
        return;
      }
      next(err);
    }
  };

  saveInvoice = this.saveBill;

  duplicateBill = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.duplicateBill(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  deleteBill = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const force = req.query.force === '1' || req.query.force === 'true';
      const permanent = req.query.permanent === '1' || req.query.permanent === 'true';
      const result = this.service.deleteBill(req.params.id, { force, permanent });
      res.json(result);
    } catch (err: any) {
      if (err.statusCode === 409 && err.error === 'client-credit-dependency') {
        res.status(409).json({
          error: 'client-credit-dependency',
          message: err.message,
          dependents: err.dependents,
        });
        return;
      }
      next(err);
    }
  };

  deleteInvoice = this.deleteBill;
}

export const invoicingController = new InvoicingController();
export const billsController = invoicingController;
