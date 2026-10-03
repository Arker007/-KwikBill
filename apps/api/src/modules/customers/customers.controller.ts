import type { Request, Response, NextFunction } from 'express';
import { CustomersService, customersService } from './customers.service.ts';

export class CustomersController {
  private service: CustomersService;

  constructor(service?: CustomersService) {
    this.service = service || customersService;
  }

  getCustomers = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const clients = this.service.listCustomers();
      res.json(clients);
    } catch (err) {
      next(err);
    }
  };

  getClients = this.getCustomers;

  getCustomer = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const client = this.service.getCustomer(req.params.id);
      if (!client) {
        res.status(404).json({ error: 'Client not found' });
        return;
      }
      res.json(client);
    } catch (err) {
      next(err);
    }
  };

  getClient = this.getCustomer;

  saveCustomer = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const payload = { ...req.body };
      if (req.params.id && !payload.id) {
        payload.id = req.params.id;
      }
      const result = this.service.saveCustomer(payload);
      res.json(result);
    } catch (err: any) {
      if (err.statusCode === 400) {
        res.status(400).json({ error: err.message });
        return;
      }
      next(err);
    }
  };

  saveClient = this.saveCustomer;

  deleteCustomer = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.deleteCustomer(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  deleteClient = this.deleteCustomer;
}

export const customersController = new CustomersController();
export const clientsController = customersController;
