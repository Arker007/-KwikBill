import { Router } from 'express';
import { clientsController } from './clients.controller.js';

export const clientsRouter = Router();

clientsRouter.get('/', clientsController.getClients);
clientsRouter.get('/:id', clientsController.getClient);
clientsRouter.post('/', clientsController.saveClient);
clientsRouter.put('/', clientsController.saveClient);
clientsRouter.put('/:id', clientsController.saveClient);
clientsRouter.delete('/:id', clientsController.deleteClient);
