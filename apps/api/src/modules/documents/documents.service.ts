import { documentsRepository, DocumentsRepository, DocumentTemplateRecord } from './documents.repository.ts';
import { BadRequestError } from '../../platform/errors/AppError.ts';

export const DEFAULT_GST_DECLARATION =
  'We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.';

export class DocumentsService {
  private repo: DocumentsRepository;

  constructor(repo?: DocumentsRepository) {
    this.repo = repo || documentsRepository;
  }

  listTemplates(): DocumentTemplateRecord[] {
    const templates = this.repo.getAllTemplates();
    return templates.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  getTemplate(id: string): DocumentTemplateRecord | null {
    return this.repo.getTemplateById(id);
  }

  saveTemplate(template: any): { ok: boolean; success: boolean; id: string } {
    if (!template || typeof template !== 'object') {
      throw new BadRequestError('Invalid template payload');
    }

    const tpl: DocumentTemplateRecord = { ...template };
    if (!tpl.id) {
      tpl.id = 'tpl_' + Date.now();
    }
    if (!tpl.declarationClause) {
      tpl.declarationClause = DEFAULT_GST_DECLARATION;
    }

    this.repo.saveTemplate(tpl);
    return { ok: true, success: true, id: tpl.id };
  }

  deleteTemplate(id: string): { ok: boolean; success: boolean; id: string } {
    if (!id) throw new BadRequestError('Template ID is required');
    this.repo.deleteTemplate(id);
    return { ok: true, success: true, id };
  }
}

export const documentsService = new DocumentsService();
export const templatesService = documentsService;
