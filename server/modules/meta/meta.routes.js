import { Router } from 'express';
import { metaController } from './meta.controller.js';

export const metaRouter = Router();

metaRouter.get('/:key', metaController.getByKey);
metaRouter.post('/:key', metaController.setByKey);
metaRouter.post('/:key/increment', metaController.increment);
