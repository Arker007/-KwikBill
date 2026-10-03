import { Router } from 'express';
import { organizationController } from './organization.controller.ts';

export const profilesRouter = Router();

profilesRouter.get('/', organizationController.list);
profilesRouter.get('/:id', organizationController.getById);
profilesRouter.post('/', organizationController.save);
profilesRouter.delete('/:id', organizationController.delete);

export const singleProfileRouter = Router();

singleProfileRouter.get('/', organizationController.getPrimary);
singleProfileRouter.post('/', organizationController.savePrimary);

export const organizationRouter = profilesRouter;
export const singleOrganizationRouter = singleProfileRouter;
