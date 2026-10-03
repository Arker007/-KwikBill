import { CLIENTS_DIR } from '../../config/paths.js';
import { CollectionRepository } from '../../infrastructure/storage/CollectionRepository.js';

export class ClientsRepository {
  constructor() {
    this.repo = new CollectionRepository(CLIENTS_DIR, { idField: 'id' });
  }

  /**
   * Reads all saved clients.
   * @returns {object[]}
   */
  getAllClients() {
    return this.repo.findAll();
  }

  /**
   * Reads a single client by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getClientById(id) {
    return this.repo.findById(id);
  }

  /**
   * Checks if a client with given ID exists.
   * @param {string} id
   * @returns {boolean}
   */
  clientExists(id) {
    return this.repo.exists(id);
  }

  /**
   * Saves or overwrites a client.
   * @param {object} client
   * @returns {object}
   */
  saveClient(client) {
    return this.repo.save(client);
  }

  /**
   * Deletes a client from disk.
   * @param {string} id
   * @returns {boolean}
   */
  deleteClient(id) {
    return this.repo.delete(id);
  }
}

export const clientsRepository = new ClientsRepository();
