import { productsRepository } from './products.repository.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

export class ProductsService {
  constructor(repo = productsRepository) {
    this.repo = repo;
  }

  /**
   * Retrieves all products sorted alphabetically by name.
   * @returns {object[]}
   */
  listProducts() {
    const products = this.repo.getAllProducts();
    return products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  /**
   * Retrieves a single product by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getProduct(id) {
    return this.repo.getProductById(id);
  }

  /**
   * Saves a new or updated product. Generates an ID if missing.
   * @param {object} product
   * @returns {{ success: boolean, id: string }}
   */
  saveProduct(product) {
    if (!product || typeof product !== 'object') {
      throw new BadRequestError('Invalid product payload');
    }

    const productToSave = { ...product };
    if (!productToSave.id) {
      productToSave.id = 'prod_' + Date.now();
    }

    this.repo.saveProduct(productToSave);
    return { success: true, id: productToSave.id };
  }

  /**
   * Deletes a product by ID.
   * @param {string} id
   * @returns {{ success: boolean }}
   */
  deleteProduct(id) {
    this.repo.deleteProduct(id);
    return { success: true };
  }
}

export const productsService = new ProductsService();
