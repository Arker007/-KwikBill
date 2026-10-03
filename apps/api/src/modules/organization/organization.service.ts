import { OrganizationRepository, organizationRepository, BusinessProfile } from './organization.repository.ts';
import { BadRequestError } from '../../platform/errors/AppError.ts';

export class OrganizationService {
  private repository: OrganizationRepository;

  constructor(repository?: OrganizationRepository) {
    this.repository = repository || organizationRepository;
  }

  /**
   * Retrieves the standalone primary business profile (data/profile.json).
   */
  getPrimaryProfile(): BusinessProfile {
    return this.repository.getPrimaryProfile();
  }

  /**
   * Saves the standalone primary business profile (data/profile.json).
   */
  savePrimaryProfile(item: any): { ok: boolean; success: boolean; profile: BusinessProfile } {
    if (!item || typeof item !== 'object') {
      throw new BadRequestError('Invalid profile payload');
    }
    const saved = this.repository.savePrimaryProfile(item);
    return { ok: true, success: true, profile: saved };
  }

  /**
   * Lists business profiles sorted by businessName ascending.
   */
  listProfiles(): BusinessProfile[] {
    const items = this.repository.findAll();
    return items.sort((a, b) => (a.businessName || '').localeCompare(b.businessName || ''));
  }

  /**
   * Retrieves single business profile by id.
   */
  getProfile(id: string): BusinessProfile | null {
    if (!id) throw new BadRequestError('Profile ID is required');
    return this.repository.findById(id);
  }

  /**
   * Saves or creates a business profile in the profiles collection.
   */
  saveProfile(item: any): { success: boolean; id: string } {
    if (!item || typeof item !== 'object') {
      throw new BadRequestError('Invalid profile payload');
    }
    const prof: BusinessProfile = { ...item };
    if (!prof.id) {
      prof.id = 'biz_' + Date.now();
    }
    this.repository.save(prof);
    return { success: true, id: prof.id };
  }

  /**
   * Deletes a business profile by id.
   */
  deleteProfile(id: string): { success: boolean } {
    if (!id) throw new BadRequestError('Profile ID is required');
    this.repository.delete(id);
    return { success: true };
  }
}

export const organizationService = new OrganizationService();
