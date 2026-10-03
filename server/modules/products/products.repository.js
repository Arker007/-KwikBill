import { PRODUCTS_DIR } from '../../config/paths.js';
import { CollectionRepository } from '../../infrastructure/storage/CollectionRepository.js';

export class ProductsRepository {
  constructor() {
    this.repo = new CollectionRepository(PRODUCTS_DIR, { idField: 'id' });
  }

  /**
   * Reads all saved products.
   * @returns {object[]}
   */
  getAllProducts() {
    return this.repo.findAll();
  }

  /**
   * Reads a single product by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getProductById(id) {
    return this.repo.findById(id);
  }

  /**
   * Checks if a product with given ID exists.
   * @param {string} id
   * @returns {boolean}
   */
  productExists(id) {
    return this.repo.exists(id);
  }

  /**
   * Saves or overwrites a product.
   * @param {object} product
   * @returns {object}
   */
  saveProduct(product) {
    return this.repo.save(product);
  }

  /**
   * Deletes a product from disk.
   * @param {string} id
   * @returns {boolean}
   */
  deleteProduct(id) {
    return this.repo.delete(id);
  }
}

export const productsRepository = new ProductsRepository();
