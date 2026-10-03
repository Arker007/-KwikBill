import { Router } from 'express';
import { profilesController } from './profiles.controller.js';

export const profilesRouter = Router();

profilesRouter.get('/', profilesController.list);
profilesRouter.get('/:id', profilesController.getById);
profilesRouter.post('/', profilesController.save);
profilesRouter.delete('/:id', profilesController.delete);

export const singleProfileRouter = Router();

singleProfileRouter.get('/', profilesController.getPrimary);
singleProfileRouter.post('/', profilesController.savePrimary);
