import { recurringRepository, RecurringRepository, RecurringTemplate } from './recurring.repository.ts';
import { BadRequestError } from '../../platform/errors/AppError.ts';

export class RecurringService {
  private repository: RecurringRepository;

  constructor(repository?: RecurringRepository) {
    this.repository = repository || recurringRepository;
  }

  /**
   * Lists recurring invoice templates sorted by clientName ascending.
   */
  listRecurring(): RecurringTemplate[] {
    const items = this.repository.findAll();
    return items.sort((a, b) => (a.clientName || '').localeCompare(b.clientName || ''));
  }

  /**
   * Retrieves single recurring invoice template by id.
   */
  getRecurring(id: string): RecurringTemplate | null {
    if (!id) throw new BadRequestError('Recurring template ID is required');
    return this.repository.findById(id);
  }

  /**
   * Calculates the next due date based on frequency and current base date.
   */
  computeNextDueDate(baseDateStr: string, frequency: string): string {
    const base = new Date(baseDateStr);
    if (isNaN(base.getTime())) {
      return new Date().toISOString().split('T')[0];
    }

    const next = new Date(base);
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'semi-annually':
        next.setMonth(next.getMonth() + 6);
        break;
      case 'annually':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        next.setMonth(next.getMonth() + 1);
    }
    return next.toISOString().split('T')[0];
  }

  /**
   * Saves or creates a recurring invoice template.
   */
  saveRecurring(item: any): { success: boolean; id: string } {
    if (!item || typeof item !== 'object') {
      throw new BadRequestError('Invalid recurring template payload');
    }
    const template: RecurringTemplate = { ...item };
    if (!template.id) {
      template.id = 'rec_' + Date.now();
    }
    if (!template.nextDueDate && template.startDate) {
      template.nextDueDate = template.startDate;
    }
    this.repository.save(template);
    return { success: true, id: template.id };
  }

  /**
   * Deletes a recurring invoice template by id.
   */
  deleteRecurring(id: string): { success: boolean } {
    if (!id) throw new BadRequestError('Recurring template ID is required');
    this.repository.delete(id);
    return { success: true };
  }
}

export const recurringService = new RecurringService();
