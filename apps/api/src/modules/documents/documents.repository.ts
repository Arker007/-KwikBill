import { TEMPLATES_DIR } from '../../config/paths.ts';
import { CollectionRepository } from '../../../../../server/infrastructure/storage/CollectionRepository.js';

export interface DocumentTemplateRecord {
  id?: string;
  name?: string;
  type?: string;
  layout?: string;
  paperSize?: string;
  orientation?: 'portrait' | 'landscape';
  headerConfig?: any;
  footerConfig?: any;
  termsAndConditions?: string;
  declarationClause?: string;
  authorizedSignature?: {
    label?: string;
    designation?: string;
    signatureUrl?: string;
  };
  styles?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export class DocumentsRepository {
  private repo: any;

  constructor(repo?: any) {
    this.repo = repo || new CollectionRepository(TEMPLATES_DIR, { idField: 'id' });
  }

  getAllTemplates(): DocumentTemplateRecord[] {
    return this.repo.findAll();
  }

  async getAllTemplatesAsync(): Promise<DocumentTemplateRecord[]> {
    return await this.repo.findAllAsync();
  }

  getTemplateById(id: string): DocumentTemplateRecord | null {
    return this.repo.findById(id);
  }

  async getTemplateByIdAsync(id: string): Promise<DocumentTemplateRecord | null> {
    return await this.repo.findByIdAsync(id);
  }

  saveTemplate(template: DocumentTemplateRecord): DocumentTemplateRecord {
    return this.repo.save(template);
  }

  async saveTemplateAsync(template: DocumentTemplateRecord): Promise<DocumentTemplateRecord> {
    return await this.repo.saveAsync(template);
  }

  deleteTemplate(id: string): boolean {
    return this.repo.delete(id);
  }

  async deleteTemplateAsync(id: string): Promise<boolean> {
    return await this.repo.deleteAsync(id);
  }
}

export const documentsRepository = new DocumentsRepository();
export const templatesRepository = documentsRepository;
