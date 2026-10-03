import { templatesRepository } from './templates.repository.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

export class TemplatesService {
  constructor(repo = templatesRepository) {
    this.repo = repo;
  }

  listTemplates() {
    const templates = this.repo.getAllTemplates();
    return templates.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  getTemplate(id) {
    return this.repo.getTemplateById(id);
  }

  saveTemplate(template) {
    if (!template || typeof template !== 'object') {
      throw new BadRequestError('Invalid template payload');
    }

    const tpl = { ...template };
    if (!tpl.id) {
      tpl.id = 'tpl_' + Date.now();
    }

    this.repo.saveTemplate(tpl);
    return { ok: true, success: true, id: tpl.id };
  }

  deleteTemplate(id) {
    if (!id) throw new BadRequestError('Template ID is required');
    this.repo.deleteTemplate(id);
    return { ok: true, success: true, id };
  }
}

export const templatesService = new TemplatesService();
