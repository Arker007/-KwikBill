import { TEMPLATES_DIR } from '../../config/paths.js';
import { CollectionRepository } from '../../infrastructure/storage/CollectionRepository.js';

export class TemplatesRepository {
  constructor(collectionRepo) {
    this.repo = collectionRepo || new CollectionRepository(TEMPLATES_DIR, { idField: 'id' });
  }

  getAllTemplates() {
    return this.repo.findAll();
  }

  getTemplateById(id) {
    return this.repo.findById(id);
  }

  saveTemplate(template) {
    return this.repo.save(template);
  }

  deleteTemplate(id) {
    return this.repo.delete(id);
  }
}

export const templatesRepository = new TemplatesRepository();
