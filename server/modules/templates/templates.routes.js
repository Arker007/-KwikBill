import { Router } from 'express';
import { templatesController } from './templates.controller.js';

export const templatesRouter = Router();

templatesRouter.get('/', templatesController.getTemplates);
templatesRouter.get('/:id', templatesController.getTemplate);
templatesRouter.post('/', templatesController.saveTemplate);
templatesRouter.delete('/:id', templatesController.deleteTemplate);
