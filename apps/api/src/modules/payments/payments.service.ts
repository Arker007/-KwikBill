import { paymentsRepository, PaymentsRepository, PaymentReceiptRecord } from './payments.repository.ts';
import { BadRequestError } from '../../platform/errors/AppError.ts';

export class PaymentsService {
  private repo: PaymentsRepository;

  constructor(repo?: PaymentsRepository) {
    this.repo = repo || paymentsRepository;
  }

  /**
   * Retrieves all payment receipts sorted descending by date.
   */
  listReceipts(): PaymentReceiptRecord[] {
    const receipts = this.repo.getAllReceipts();
    return receipts.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

  /**
   * Retrieves a single receipt by ID.
   */
  getReceipt(id: string): PaymentReceiptRecord | null {
    return this.repo.getReceiptById(id);
  }

  /**
   * Saves a new or updated receipt.
   */
  saveReceipt(receipt: any): { success: boolean; id: string } {
    if (!receipt || typeof receipt !== 'object') {
      throw new BadRequestError('Invalid receipt payload');
    }

    const receiptToSave: PaymentReceiptRecord = { ...receipt };
    if (!receiptToSave.id) {
      receiptToSave.id = 'rcp_' + Date.now();
    }

    this.repo.saveReceipt(receiptToSave);
    return { success: true, id: receiptToSave.id };
  }

  /**
   * Deletes a receipt by ID.
   */
  deleteReceipt(id: string): { success: boolean } {
    this.repo.deleteReceipt(id);
    return { success: true };
  }
}

export const paymentsService = new PaymentsService();
export const receiptsService = paymentsService;
