import { CLIENTS_DIR } from '../../config/paths.ts';
import { CollectionRepository } from '../../../../../server/infrastructure/storage/CollectionRepository.js';

export interface Customer {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  address?: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
  openingBalance?: number;
  creditLimit?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export class CustomersRepository {
  private repo: any;

  constructor(repo?: any) {
    this.repo = repo || new CollectionRepository(CLIENTS_DIR, { idField: 'id' });
  }

  /**
   * Reads all saved customers.
   */
  getAllCustomers(): Customer[] {
    return this.repo.findAll();
  }

  async getAllCustomersAsync(): Promise<Customer[]> {
    return await this.repo.findAllAsync();
  }

  /**
   * Reads a single customer by ID.
   */
  getCustomerById(id: string): Customer | null {
    return this.repo.findById(id);
  }

  async getCustomerByIdAsync(id: string): Promise<Customer | null> {
    return await this.repo.findByIdAsync(id);
  }

  /**
   * Checks if a customer with given ID exists.
   */
  customerExists(id: string): boolean {
    return this.repo.exists(id);
  }

  /**
   * Saves or overwrites a customer.
   */
  saveCustomer(customer: Customer): Customer {
    return this.repo.save(customer);
  }

  async saveCustomerAsync(customer: Customer): Promise<Customer> {
    return await this.repo.saveAsync(customer);
  }

  /**
   * Deletes a customer.
   */
  deleteCustomer(id: string): boolean {
    return this.repo.delete(id);
  }

  async deleteCustomerAsync(id: string): Promise<boolean> {
    return await this.repo.deleteAsync(id);
  }
}

export const customersRepository = new CustomersRepository();
export const clientsRepository = customersRepository;
