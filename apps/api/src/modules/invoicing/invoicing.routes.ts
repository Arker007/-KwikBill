import { Router } from 'express';
import { invoicingController } from './invoicing.controller.ts';

export const invoicingRouter = Router();

invoicingRouter.get('/', invoicingController.getBills);
invoicingRouter.get('/:id', invoicingController.getBill);
invoicingRouter.post('/', invoicingController.saveBill);
invoicingRouter.post('/:id/duplicate', invoicingController.duplicateBill);
invoicingRouter.delete('/:id', invoicingController.deleteBill);

export const billsRouter = invoicingRouter;
