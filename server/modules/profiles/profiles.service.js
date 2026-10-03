import { profilesRepository } from './profiles.repository.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

export class ProfilesService {
  /**
   * @param {import('./profiles.repository.js').ProfilesRepository} [repository]
   */
  constructor(repository) {
    this.repository = repository || profilesRepository;
  }

  /**
   * Retrieves the standalone primary business profile (data/profile.json).
   * @returns {object}
   */
  getPrimaryProfile() {
    return this.repository.getPrimaryProfile();
  }

  /**
   * Saves the standalone primary business profile (data/profile.json).
   * @param {object} item
   * @returns {{ ok: boolean, success: boolean, profile: object }}
   */
  savePrimaryProfile(item) {
    if (!item || typeof item !== 'object') {
      throw new BadRequestError('Invalid profile payload');
    }
    const saved = this.repository.savePrimaryProfile(item);
    return { ok: true, success: true, profile: saved };
  }

  /**
   * Lists business profiles sorted by businessName ascending.
   * @returns {Array}
   */
  listProfiles() {
    const items = this.repository.findAll();
    return items.sort((a, b) => (a.businessName || '').localeCompare(b.businessName || ''));
  }

  /**
   * Retrieves single business profile by id.
   * @param {string} id
   * @returns {object|null}
   */
  getProfile(id) {
    if (!id) throw new BadRequestError('Profile ID is required');
    return this.repository.findById(id);
  }

  /**
   * Saves or creates a business profile.
   * @param {object} item
   * @returns {{ success: boolean, id: string }}
   */
  saveProfile(item) {
    if (!item || typeof item !== 'object') {
      throw new BadRequestError('Invalid profile payload');
    }
    const prof = { ...item };
    if (!prof.id) {
      prof.id = 'biz_' + Date.now();
    }
    this.repository.save(prof);
    return { success: true, id: prof.id };
  }

  /**
   * Deletes a business profile by id.
   * @param {string} id
   * @returns {{ success: boolean }}
   */
  deleteProfile(id) {
    if (!id) throw new BadRequestError('Profile ID is required');
    this.repository.delete(id);
    return { success: true };
  }
}

export const profilesService = new ProfilesService();
