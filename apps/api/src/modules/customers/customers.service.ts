import { CustomersRepository, customersRepository, Customer } from './customers.repository.ts';
import { BadRequestError } from '../../platform/errors/AppError.ts';

export class CustomersService {
  private repo: CustomersRepository;

  constructor(repo?: CustomersRepository) {
    this.repo = repo || customersRepository;
  }

  /**
   * Retrieves all customers sorted alphabetically by name.
   */
  listCustomers(): Customer[] {
    const clients = this.repo.getAllCustomers();
    return clients.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  listClients(): Customer[] {
    return this.listCustomers();
  }

  /**
   * Retrieves a single customer by ID.
   */
  getCustomer(id: string): Customer | null {
    return this.repo.getCustomerById(id);
  }

  getClient(id: string): Customer | null {
    return this.getCustomer(id);
  }

  /**
   * Saves a new or updated customer. Generates an ID if missing.
   */
  saveCustomer(client: any): { success: boolean; id: string } {
    if (!client || typeof client !== 'object') {
      throw new BadRequestError('Invalid client payload');
    }
    if (!client.name || typeof client.name !== 'string' || !client.name.trim()) {
      throw new BadRequestError('Customer name is required');
    }

    const clientToSave: Customer = { ...client, name: client.name.trim() };
    if (!clientToSave.id) {
      clientToSave.id = 'cli_' + Date.now();
    }

    this.repo.saveCustomer(clientToSave);
    return { success: true, id: clientToSave.id };
  }

  saveClient(client: any): { success: boolean; id: string } {
    return this.saveCustomer(client);
  }

  /**
   * Deletes a customer by ID.
   */
  deleteCustomer(id: string): { success: boolean } {
    this.repo.deleteCustomer(id);
    return { success: true };
  }

  deleteClient(id: string): { success: boolean } {
    return this.deleteCustomer(id);
  }
}

export const customersService = new CustomersService();
export const clientsService = customersService;
