import { Router } from 'express';
import { catalogController } from './catalog.controller.ts';

export const catalogRouter = Router();

catalogRouter.get('/', catalogController.getProducts);
catalogRouter.get('/:id', catalogController.getProduct);
catalogRouter.post('/', catalogController.saveProduct);
catalogRouter.put('/', catalogController.saveProduct);
catalogRouter.put('/:id', catalogController.saveProduct);
catalogRouter.delete('/:id', catalogController.deleteProduct);

export const productsRouter = catalogRouter;
