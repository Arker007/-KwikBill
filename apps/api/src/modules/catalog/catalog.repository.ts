import { PRODUCTS_DIR } from '../../config/paths.ts';
import { CollectionRepository } from '../../../../../server/infrastructure/storage/CollectionRepository.js';

export interface Product {
  id?: string;
  name: string;
  sku?: string;
  barcode?: string;
  hsn?: string;
  sac?: string;
  unit?: string;
  price?: number;
  purchasePrice?: number;
  taxRate?: number;
  taxIncluded?: boolean;
  stock?: number;
  minStock?: number;
  category?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export class CatalogRepository {
  private repo: any;

  constructor(repo?: any) {
    this.repo = repo || new CollectionRepository(PRODUCTS_DIR, { idField: 'id' });
  }

  /**
   * Reads all saved products.
   */
  getAllProducts(): Product[] {
    return this.repo.findAll();
  }

  async getAllProductsAsync(): Promise<Product[]> {
    return await this.repo.findAllAsync();
  }

  /**
   * Reads a single product by ID.
   */
  getProductById(id: string): Product | null {
    return this.repo.findById(id);
  }

  async getProductByIdAsync(id: string): Promise<Product | null> {
    return await this.repo.findByIdAsync(id);
  }

  /**
   * Checks if a product with given ID exists.
   */
  productExists(id: string): boolean {
    return this.repo.exists(id);
  }

  /**
   * Saves or overwrites a product.
   */
  saveProduct(product: Product): Product {
    return this.repo.save(product);
  }

  async saveProductAsync(product: Product): Promise<Product> {
    return await this.repo.saveAsync(product);
  }

  /**
   * Deletes a product.
   */
  deleteProduct(id: string): boolean {
    return this.repo.delete(id);
  }

  async deleteProductAsync(id: string): Promise<boolean> {
    return await this.repo.deleteAsync(id);
  }
}

export const catalogRepository = new CatalogRepository();
export const productsRepository = catalogRepository;
