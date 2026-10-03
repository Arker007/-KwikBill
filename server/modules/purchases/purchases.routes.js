import { Router } from 'express';
import { purchasesController } from './purchases.controller.js';

export const purchasesRouter = Router();

purchasesRouter.get('/', purchasesController.getPurchases);
purchasesRouter.get('/:id', purchasesController.getPurchase);
purchasesRouter.post('/', purchasesController.savePurchase);
purchasesRouter.put('/', purchasesController.savePurchase);
purchasesRouter.put('/:id', purchasesController.savePurchase);
purchasesRouter.delete('/:id', purchasesController.deletePurchase);
