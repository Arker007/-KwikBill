import { RECEIPTS_DIR } from '../../config/paths.ts';
import { CollectionRepository } from '../../../../../server/infrastructure/storage/CollectionRepository.js';

export interface PaymentReceiptRecord {
  id?: string;
  receiptNumber?: string;
  date?: string;
  clientId?: string;
  clientName?: string;
  amount?: number;
  paymentMode?: 'cash' | 'bank_transfer' | 'cheque' | 'upi' | 'credit_card' | 'other';
  referenceNumber?: string;
  bankName?: string;
  allocations?: Array<{
    invoiceId: string;
    invoiceNumber?: string;
    amountAllocated: number;
  }>;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export class PaymentsRepository {
  private repo: any;

  constructor(repo?: any) {
    this.repo = repo || new CollectionRepository(RECEIPTS_DIR, { idField: 'id' });
  }

  getAllReceipts(): PaymentReceiptRecord[] {
    return this.repo.findAll();
  }

  async getAllReceiptsAsync(): Promise<PaymentReceiptRecord[]> {
    return await this.repo.findAllAsync();
  }

  getReceiptById(id: string): PaymentReceiptRecord | null {
    return this.repo.findById(id);
  }

  async getReceiptByIdAsync(id: string): Promise<PaymentReceiptRecord | null> {
    return await this.repo.findByIdAsync(id);
  }

  receiptExists(id: string): boolean {
    return this.repo.exists(id);
  }

  saveReceipt(receipt: PaymentReceiptRecord): PaymentReceiptRecord {
    return this.repo.save(receipt);
  }

  async saveReceiptAsync(receipt: PaymentReceiptRecord): Promise<PaymentReceiptRecord> {
    return await this.repo.saveAsync(receipt);
  }

  deleteReceipt(id: string): boolean {
    return this.repo.delete(id);
  }

  async deleteReceiptAsync(id: string): Promise<boolean> {
    return await this.repo.deleteAsync(id);
  }
}

export const paymentsRepository = new PaymentsRepository();
export const receiptsRepository = paymentsRepository;
