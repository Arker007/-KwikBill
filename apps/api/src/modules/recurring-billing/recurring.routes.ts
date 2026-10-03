import { Router } from 'express';
import { recurringController } from './recurring.controller.ts';

export const recurringRouter = Router();

recurringRouter.get('/', recurringController.list);
recurringRouter.get('/:id', recurringController.getById);
recurringRouter.post('/', recurringController.save);
recurringRouter.delete('/:id', recurringController.delete);
