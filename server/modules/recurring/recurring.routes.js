import { Router } from 'express';
import { recurringController } from './recurring.controller.js';

export const recurringRouter = Router();

recurringRouter.get('/', recurringController.list);
recurringRouter.get('/:id', recurringController.getById);
recurringRouter.post('/', recurringController.save);
recurringRouter.put('/', recurringController.save);
recurringRouter.put('/:id', recurringController.save);
recurringRouter.delete('/:id', recurringController.delete);
