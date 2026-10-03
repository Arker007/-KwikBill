import { Router } from 'express';
import { customersController } from './customers.controller.ts';

export const customersRouter = Router();

customersRouter.get('/', customersController.getCustomers);
customersRouter.get('/:id', customersController.getCustomer);
customersRouter.post('/', customersController.saveCustomer);
customersRouter.put('/', customersController.saveCustomer);
customersRouter.put('/:id', customersController.saveCustomer);
customersRouter.delete('/:id', customersController.deleteCustomer);

export const clientsRouter = customersRouter;
