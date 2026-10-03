import { templatesService } from './templates.service.js';

export class TemplatesController {
  constructor(service = templatesService) {
    this.service = service;
  }

  getTemplates = (req, res, next) => {
    try {
      const templates = this.service.listTemplates();
      res.json(templates);
    } catch (err) {
      next(err);
    }
  };

  getTemplate = (req, res, next) => {
    try {
      const template = this.service.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      res.json(template);
    } catch (err) {
      next(err);
    }
  };

  saveTemplate = (req, res, next) => {
    try {
      const result = this.service.saveTemplate(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  deleteTemplate = (req, res, next) => {
    try {
      const result = this.service.deleteTemplate(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const templatesController = new TemplatesController();
