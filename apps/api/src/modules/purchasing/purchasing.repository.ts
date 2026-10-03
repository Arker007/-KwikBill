import { PURCHASES_DIR } from '../../config/paths.ts';
import { CollectionRepository } from '../../../../../server/infrastructure/storage/CollectionRepository.js';

export interface PurchaseRecord {
  id?: string;
  vendorId?: string;
  vendorName?: string;
  vendorGstin?: string;
  billNumber?: string;
  date?: string;
  dueDate?: string;
  items?: any[];
  subtotal?: number;
  totalTax?: number;
  grandTotal?: number;
  itcEligible?: boolean;
  notes?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export class PurchasingRepository {
  private repo: any;

  constructor(repo?: any) {
    this.repo = repo || new CollectionRepository(PURCHASES_DIR, { idField: 'id' });
  }

  getAllPurchases(): PurchaseRecord[] {
    return this.repo.findAll();
  }

  async getAllPurchasesAsync(): Promise<PurchaseRecord[]> {
    return await this.repo.findAllAsync();
  }

  getPurchaseById(id: string): PurchaseRecord | null {
    return this.repo.findById(id);
  }

  async getPurchaseByIdAsync(id: string): Promise<PurchaseRecord | null> {
    return await this.repo.findByIdAsync(id);
  }

  purchaseExists(id: string): boolean {
    return this.repo.exists(id);
  }

  savePurchase(purchase: PurchaseRecord): PurchaseRecord {
    return this.repo.save(purchase);
  }

  async savePurchaseAsync(purchase: PurchaseRecord): Promise<PurchaseRecord> {
    return await this.repo.saveAsync(purchase);
  }

  deletePurchase(id: string): boolean {
    return this.repo.delete(id);
  }

  async deletePurchaseAsync(id: string): Promise<boolean> {
    return await this.repo.deleteAsync(id);
  }
}

export const purchasingRepository = new PurchasingRepository();
export const purchasesRepository = purchasingRepository;
