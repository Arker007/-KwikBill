import { purchasingRepository, PurchasingRepository, PurchaseRecord } from './purchasing.repository.ts';
import { BadRequestError } from '../../platform/errors/AppError.ts';

export class PurchasingService {
  private repo: PurchasingRepository;

  constructor(repo?: PurchasingRepository) {
    this.repo = repo || purchasingRepository;
  }

  listPurchases(): PurchaseRecord[] {
    const purchases = this.repo.getAllPurchases();
    return purchases.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

  getPurchase(id: string): PurchaseRecord | null {
    return this.repo.getPurchaseById(id);
  }

  savePurchase(purchase: any): { success: boolean; id: string } {
    if (!purchase || typeof purchase !== 'object') {
      throw new BadRequestError('Invalid purchase payload');
    }

    const purchaseToSave: PurchaseRecord = { ...purchase };
    if (!purchaseToSave.id) {
      purchaseToSave.id = 'pur_' + Date.now();
    }

    this.repo.savePurchase(purchaseToSave);
    return { success: true, id: purchaseToSave.id };
  }

  deletePurchase(id: string): { success: boolean } {
    this.repo.deletePurchase(id);
    return { success: true };
  }
}

export const purchasingService = new PurchasingService();
export const purchasesService = purchasingService;
