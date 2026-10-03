import { Router } from 'express';
import { billsController } from './bills.controller.js';

export const billsRouter = Router();

billsRouter.get('/', billsController.getBills);
billsRouter.get('/:id', billsController.getBill);
billsRouter.post('/', billsController.saveBill);
billsRouter.put('/', billsController.saveBill);
billsRouter.put('/:id', billsController.saveBill);
billsRouter.delete('/:id', billsController.deleteBill);
