import { countersRepository, CountersRepository } from './counters.repository.ts';
import { BadRequestError } from '../../../platform/errors/AppError.ts';

export class SequenceGenerator {
  private repo: CountersRepository;

  constructor(repo?: CountersRepository) {
    this.repo = repo || countersRepository;
  }

  /**
   * Atomically increments a numeric counter and returns next value.
   */
  incrementCounter(key: string): number {
    if (!key) throw new BadRequestError('Counter key is required');
    let nextValue = 1;
    this.repo.update((meta) => {
      const current = Number(meta?.[key] || 0);
      nextValue = current + 1;
      return {
        ...(meta || {}),
        [key]: nextValue,
      };
    });
    return nextValue;
  }

  /**
   * Reads a counter or metadata value.
   */
  getCounter(key: string): any {
    if (!key) throw new BadRequestError('Counter key is required');
    const meta = this.repo.get();
    return meta[key] ?? null;
  }

  /**
   * Sets a counter or metadata value.
   */
  setCounter(key: string, value: any): void {
    if (!key) throw new BadRequestError('Counter key is required');
    this.repo.update((meta) => {
      const updated = { ...(meta || {}) };
      updated[key] = value;
      return updated;
    });
  }

  /**
   * Formats an invoice number with prefix, fiscal year, and zero-padded sequence.
   */
  formatInvoiceNumber(
    prefix: string = 'INV',
    sequence: number,
    padLength: number = 4,
    fiscalYear?: string
  ): string {
    const padded = String(sequence).padStart(padLength, '0');
    if (fiscalYear) {
      return `${prefix}/${fiscalYear}/${padded}`;
    }
    return `${prefix}-${padded}`;
  }
}

export const sequenceGenerator = new SequenceGenerator();
