import { clientsRepository } from './clients.repository.js';
import { BadRequestError, NotFoundError } from '../../shared/errors/AppError.js';

export class ClientsService {
  constructor(repo = clientsRepository) {
    this.repo = repo;
  }

  /**
   * Retrieves all clients sorted alphabetically by name.
   * @returns {object[]}
   */
  listClients() {
    const clients = this.repo.getAllClients();
    return clients.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  /**
   * Retrieves a single client by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getClient(id) {
    return this.repo.getClientById(id);
  }

  /**
   * Saves a new or updated client. Generates an ID if missing.
   * @param {object} client
   * @returns {{ success: boolean, id: string }}
   */
  saveClient(client) {
    if (!client || typeof client !== 'object') {
      throw new BadRequestError('Invalid client payload');
    }
    if (!client.name || typeof client.name !== 'string' || !client.name.trim()) {
      throw new BadRequestError('Customer name is required');
    }

    const clientToSave = { ...client, name: client.name.trim() };
    if (!clientToSave.id) {
      clientToSave.id = 'cli_' + Date.now();
    }

    this.repo.saveClient(clientToSave);
    return { success: true, id: clientToSave.id };
  }

  /**
   * Deletes a client by ID.
   * @param {string} id
   * @returns {{ success: boolean }}
   */
  deleteClient(id) {
    this.repo.deleteClient(id);
    return { success: true };
  }
}

export const clientsService = new ClientsService();
