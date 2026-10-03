import { metaRepository } from './meta.repository.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

export class MetaService {
  /**
   * @param {import('./meta.repository.js').MetaRepository} [repository]
   */
  constructor(repository) {
    this.repository = repository || metaRepository;
  }

  /**
   * Gets value for a given meta key.
   * @param {string} key
   * @returns {{ value: * }}
   */
  getMeta(key) {
    if (!key) throw new BadRequestError('Meta key is required');
    const meta = this.repository.get();
    return { value: meta[key] ?? null };
  }

  /**
   * Sets value for a given meta key.
   * @param {string} key
   * @param {*} value
   * @returns {{ success: boolean }}
   */
  setMeta(key, value) {
    if (!key) throw new BadRequestError('Meta key is required');
    this.repository.update((meta) => {
      const updated = { ...(meta || {}) };
      updated[key] = value;
      return updated;
    });
    return { success: true };
  }

  /**
   * Atomically increments a numeric counter for a given meta key.
   * Single-threaded synchronous read+atomic-write prevents race conditions.
   * @param {string} key
   * @returns {{ value: number }}
   */
  incrementMeta(key) {
    if (!key) throw new BadRequestError('Meta key is required');
    let nextValue = 1;
    this.repository.update((meta) => {
      const current = Number(meta?.[key] || 0);
      nextValue = current + 1;
      return {
        ...(meta || {}),
        [key]: nextValue,
      };
    });
    return { value: nextValue };
  }
}

export const metaService = new MetaService();
