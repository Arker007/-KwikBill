import { recurringRepository } from './recurring.repository.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

export class RecurringService {
  /**
   * @param {import('./recurring.repository.js').RecurringRepository} [repository]
   */
  constructor(repository) {
    this.repository = repository || recurringRepository;
  }

  /**
   * Lists recurring invoice templates sorted by clientName ascending.
   * @returns {Array}
   */
  listRecurring() {
    const items = this.repository.findAll();
    return items.sort((a, b) => (a.clientName || '').localeCompare(b.clientName || ''));
  }

  /**
   * Retrieves single recurring invoice template by id.
   * @param {string} id
   * @returns {object|null}
   */
  getRecurring(id) {
    if (!id) throw new BadRequestError('Recurring template ID is required');
    return this.repository.findById(id);
  }

  /**
   * Saves or creates a recurring invoice template.
   * @param {object} item
   * @returns {{ success: boolean, id: string }}
   */
  saveRecurring(item) {
    if (!item || typeof item !== 'object') {
      throw new BadRequestError('Invalid recurring template payload');
    }
    const template = { ...item };
    if (!template.id) {
      template.id = 'rec_' + Date.now();
    }
    this.repository.save(template);
    return { success: true, id: template.id };
  }

  /**
   * Deletes a recurring invoice template by id.
   * @param {string} id
   * @returns {{ success: boolean }}
   */
  deleteRecurring(id) {
    if (!id) throw new BadRequestError('Recurring template ID is required');
    this.repository.delete(id);
    return { success: true };
  }
}

export const recurringService = new RecurringService();
