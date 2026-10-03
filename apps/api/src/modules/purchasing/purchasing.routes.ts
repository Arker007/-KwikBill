import { Router } from 'express';
import { purchasingController } from './purchasing.controller.ts';

export const purchasingRouter = Router();

purchasingRouter.get('/', purchasingController.getPurchases);
purchasingRouter.get('/:id', purchasingController.getPurchase);
purchasingRouter.post('/', purchasingController.savePurchase);
purchasingRouter.delete('/:id', purchasingController.deletePurchase);

export const purchasesRouter = purchasingRouter;
