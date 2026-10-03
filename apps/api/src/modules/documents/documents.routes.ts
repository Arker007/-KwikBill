import { Router } from 'express';
import { documentsController } from './documents.controller.ts';

export const documentsRouter = Router();

documentsRouter.get('/', documentsController.getTemplates);
documentsRouter.get('/:id', documentsController.getTemplate);
documentsRouter.post('/', documentsController.saveTemplate);
documentsRouter.delete('/:id', documentsController.deleteTemplate);

export const templatesRouter = documentsRouter;
