import { Router } from 'express';
import { productsController } from './products.controller.js';

export const productsRouter = Router();

productsRouter.get('/', productsController.getProducts);
productsRouter.get('/:id', productsController.getProduct);
productsRouter.post('/', productsController.saveProduct);
productsRouter.put('/', productsController.saveProduct);
productsRouter.put('/:id', productsController.saveProduct);
productsRouter.delete('/:id', productsController.deleteProduct);
