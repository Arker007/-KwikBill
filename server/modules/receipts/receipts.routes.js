import { Router } from 'express';
import { receiptsController } from './receipts.controller.js';

export const receiptsRouter = Router();

receiptsRouter.get('/', receiptsController.getReceipts);
receiptsRouter.get('/:id', receiptsController.getReceipt);
receiptsRouter.post('/', receiptsController.saveReceipt);
receiptsRouter.put('/', receiptsController.saveReceipt);
receiptsRouter.put('/:id', receiptsController.saveReceipt);
receiptsRouter.delete('/:id', receiptsController.deleteReceipt);
