import { clientsService } from './clients.service.js';

export class ClientsController {
  constructor(service = clientsService) {
    this.service = service;
  }

  getClients = (req, res, next) => {
    try {
      const clients = this.service.listClients();
      res.json(clients);
    } catch (err) {
      next(err);
    }
  };

  getClient = (req, res, next) => {
    try {
      const client = this.service.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      res.json(client);
    } catch (err) {
      next(err);
    }
  };

  saveClient = (req, res, next) => {
    try {
      const payload = { ...req.body };
      if (req.params.id && !payload.id) {
        payload.id = req.params.id;
      }
      const result = this.service.saveClient(payload);
      res.json(result);
    } catch (err) {
      if (err.statusCode === 400) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  };

  deleteClient = (req, res, next) => {
    try {
      const result = this.service.deleteClient(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const clientsController = new ClientsController();
