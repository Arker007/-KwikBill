import { SingleFileRepository } from '../../infrastructure/storage/SingleFileRepository.js';
import { META_FILE } from '../../config/paths.js';

export class MetaRepository {
  /**
   * @param {SingleFileRepository} [singleFileRepo]
   */
  constructor(singleFileRepo) {
    this.storage = singleFileRepo || new SingleFileRepository(META_FILE, {});
  }

  get() {
    return this.storage.get({});
  }

  async getAsync() {
    return await this.storage.getAsync({});
  }

  set(data) {
    return this.storage.set(data);
  }

  async setAsync(data) {
    return await this.storage.setAsync(data);
  }

  update(updaterOrPatch) {
    return this.storage.update(updaterOrPatch);
  }

  async updateAsync(updaterOrPatch) {
    return await this.storage.updateAsync(updaterOrPatch);
  }
}

export const metaRepository = new MetaRepository();
