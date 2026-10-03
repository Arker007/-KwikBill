import { CollectionRepository } from '../../infrastructure/storage/CollectionRepository.js';
import { RECURRING_DIR } from '../../config/paths.js';

export class RecurringRepository {
  /**
   * @param {CollectionRepository} [collectionRepo]
   */
  constructor(collectionRepo) {
    this.collection = collectionRepo || new CollectionRepository(RECURRING_DIR);
  }

  findAll() {
    return this.collection.findAll();
  }

  async findAllAsync() {
    return await this.collection.findAllAsync();
  }

  findById(id) {
    return this.collection.findById(id);
  }

  async findByIdAsync(id) {
    return await this.collection.findByIdAsync(id);
  }

  save(recurring) {
    return this.collection.save(recurring);
  }

  async saveAsync(recurring) {
    return await this.collection.saveAsync(recurring);
  }

  delete(id) {
    return this.collection.delete(id);
  }

  async deleteAsync(id) {
    return await this.collection.deleteAsync(id);
  }
}

export const recurringRepository = new RecurringRepository();
