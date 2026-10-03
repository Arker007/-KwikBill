import { CatalogRepository, catalogRepository, Product } from './catalog.repository.ts';
import { BadRequestError } from '../../platform/errors/AppError.ts';

export class CatalogService {
  private repo: CatalogRepository;

  constructor(repo?: CatalogRepository) {
    this.repo = repo || catalogRepository;
  }

  /**
   * Retrieves all products sorted alphabetically by name.
   */
  listProducts(): Product[] {
    const products = this.repo.getAllProducts();
    return products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  /**
   * Retrieves a single product by ID.
   */
  getProduct(id: string): Product | null {
    return this.repo.getProductById(id);
  }

  /**
   * Saves a new or updated product. Generates an ID if missing.
   */
  saveProduct(product: any): { success: boolean; id: string } {
    if (!product || typeof product !== 'object') {
      throw new BadRequestError('Invalid product payload');
    }

    const productToSave: Product = { ...product };
    if (!productToSave.id) {
      productToSave.id = 'prod_' + Date.now();
    }

    this.repo.saveProduct(productToSave);
    return { success: true, id: productToSave.id };
  }

  /**
   * Deletes a product by ID.
   */
  deleteProduct(id: string): { success: boolean } {
    this.repo.deleteProduct(id);
    return { success: true };
  }
}

export const catalogService = new CatalogService();
export const productsService = catalogService;
