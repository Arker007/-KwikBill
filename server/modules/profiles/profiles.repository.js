import { CollectionRepository } from '../../infrastructure/storage/CollectionRepository.js';
import { SingleFileRepository } from '../../infrastructure/storage/SingleFileRepository.js';
import { PROFILES_DIR, PROFILE_FILE } from '../../config/paths.js';

export class ProfilesRepository {
  /**
   * @param {CollectionRepository} [collectionRepo]
   * @param {SingleFileRepository} [singleRepo]
   */
  constructor(collectionRepo, singleRepo) {
    this.collection = collectionRepo || new CollectionRepository(PROFILES_DIR);
    this.single = singleRepo || new SingleFileRepository(PROFILE_FILE, {
      businessName: '',
      address: '',
      gstin: '',
      phone: '',
      email: '',
      state: '',
    });
  }

  getPrimaryProfile() {
    return this.single.get({
      businessName: '',
      address: '',
      gstin: '',
      phone: '',
      email: '',
      state: '',
    }) || {};
  }

  savePrimaryProfile(profile) {
    return this.single.set(profile);
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

  save(profile) {
    return this.collection.save(profile);
  }

  async saveAsync(profile) {
    return await this.collection.saveAsync(profile);
  }

  delete(id) {
    return this.collection.delete(id);
  }

  async deleteAsync(id) {
    return await this.collection.deleteAsync(id);
  }
}

export const profilesRepository = new ProfilesRepository();
