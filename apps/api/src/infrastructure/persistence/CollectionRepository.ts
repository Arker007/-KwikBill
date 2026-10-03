import { SqliteCollectionRepository, type RepositoryOptions } from './SqliteCollectionRepository.ts';
import { JsonCollectionRepository } from './JsonCollectionRepository.ts';
import { USE_SQLITE } from '../../config/env.ts';

export { JsonCollectionRepository, SqliteCollectionRepository };
export type { RepositoryOptions };

/**
 * CollectionRepository delegating adapter.
 * Uses SqliteCollectionRepository by default (with dual-write shadow mode).
 * Dynamically togglable via USE_SQLITE environment flag.
 */
export class CollectionRepository<T = any> extends SqliteCollectionRepository<T> {
  /**
   * @param dirNameOrPath - Collection directory name (e.g. 'bills') or absolute path
   * @param options
   */
  constructor(dirNameOrPath: string, options: RepositoryOptions = {}) {
    super(dirNameOrPath, {
      ...options,
      useSqlite: options.useSqlite !== undefined ? options.useSqlite : USE_SQLITE,
    });
  }
}
