import { RECURRING_DIR } from '../../config/paths.ts';
import { CollectionRepository } from '../../../../../server/infrastructure/storage/CollectionRepository.js';

export interface RecurringTemplate {
  id?: string;
  clientId?: string;
  clientName?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
  startDate?: string;
  endDate?: string;
  nextDueDate?: string;
  lastGeneratedDate?: string;
  status?: 'active' | 'paused' | 'completed';
  autoSend?: boolean;
  items?: any[];
  notes?: string;
  terms?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export class RecurringRepository {
  private collection: any;

  constructor(collectionRepo?: any) {
    this.collection = collectionRepo || new CollectionRepository(RECURRING_DIR, { idField: 'id' });
  }

  findAll(): RecurringTemplate[] {
    return this.collection.findAll();
  }

  async findAllAsync(): Promise<RecurringTemplate[]> {
    return await this.collection.findAllAsync();
  }

  findById(id: string): RecurringTemplate | null {
    return this.collection.findById(id);
  }

  async findByIdAsync(id: string): Promise<RecurringTemplate | null> {
    return await this.collection.findByIdAsync(id);
  }

  save(recurring: RecurringTemplate): RecurringTemplate {
    return this.collection.save(recurring);
  }

  async saveAsync(recurring: RecurringTemplate): Promise<RecurringTemplate> {
    return await this.collection.saveAsync(recurring);
  }

  delete(id: string): boolean {
    return this.collection.delete(id);
  }

  async deleteAsync(id: string): Promise<boolean> {
    return await this.collection.deleteAsync(id);
  }
}

export const recurringRepository = new RecurringRepository();
