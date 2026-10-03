import { CollectionRepository } from '../../../../../server/infrastructure/storage/CollectionRepository.js';
import { SingleFileRepository } from '../../../../../server/infrastructure/storage/SingleFileRepository.js';
import { PROFILES_DIR, PROFILE_FILE } from '../../config/paths.ts';

export interface BusinessProfile {
  id?: string;
  businessName?: string;
  address?: string;
  gstin?: string;
  phone?: string;
  email?: string;
  state?: string;
  stateCode?: string;
  pan?: string;
  bankName?: string;
  bankAccount?: string;
  bankIfsc?: string;
  bankBranch?: string;
  upiId?: string;
  terms?: string;
  notes?: string;
  logoUrl?: string;
  signatureUrl?: string;
  isDefault?: boolean;
  [key: string]: any;
}

const DEFAULT_PROFILE_DATA: BusinessProfile = {
  businessName: '',
  address: '',
  gstin: '',
  phone: '',
  email: '',
  state: '',
};

export class OrganizationRepository {
  private collection: any;
  private single: any;

  constructor(collectionRepo?: any, singleRepo?: any) {
    this.collection = collectionRepo || new CollectionRepository(PROFILES_DIR);
    this.single = singleRepo || new SingleFileRepository(PROFILE_FILE, DEFAULT_PROFILE_DATA);
  }

  getPrimaryProfile(): BusinessProfile {
    return this.single.get(DEFAULT_PROFILE_DATA) || {};
  }

  savePrimaryProfile(profile: BusinessProfile): BusinessProfile {
    return this.single.set(profile);
  }

  findAll(): BusinessProfile[] {
    return this.collection.findAll();
  }

  async findAllAsync(): Promise<BusinessProfile[]> {
    return await this.collection.findAllAsync();
  }

  findById(id: string): BusinessProfile | null {
    return this.collection.findById(id);
  }

  async findByIdAsync(id: string): Promise<BusinessProfile | null> {
    return await this.collection.findByIdAsync(id);
  }

  save(profile: BusinessProfile): BusinessProfile {
    return this.collection.save(profile);
  }

  async saveAsync(profile: BusinessProfile): Promise<BusinessProfile> {
    return await this.collection.saveAsync(profile);
  }

  delete(id: string): boolean {
    return this.collection.delete(id);
  }

  async deleteAsync(id: string): Promise<boolean> {
    return await this.collection.deleteAsync(id);
  }
}

export const organizationRepository = new OrganizationRepository();
