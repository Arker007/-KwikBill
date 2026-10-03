import { Router } from 'express';
import { paymentsController } from './payments.controller.ts';

export const paymentsRouter = Router();

paymentsRouter.get('/', paymentsController.getReceipts);
paymentsRouter.get('/:id', paymentsController.getReceipt);
paymentsRouter.post('/', paymentsController.saveReceipt);
paymentsRouter.delete('/:id', paymentsController.deleteReceipt);

export const receiptsRouter = paymentsRouter;
