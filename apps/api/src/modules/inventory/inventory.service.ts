import { catalogRepository, CatalogRepository, Product } from '../catalog/catalog.repository.ts';

export interface StockAlert {
  product: Product;
  currentStock: number;
  minStock: number;
  isLowStock: boolean;
}

export interface InventoryValuation {
  totalItems: number;
  totalQuantity: number;
  totalCostValue: number;
  totalRetailValue: number;
}

export class InventoryService {
  private repo: CatalogRepository;

  constructor(repo?: CatalogRepository) {
    this.repo = repo || catalogRepository;
  }

  /**
   * Get all products below their minStock threshold.
   */
  getLowStockAlerts(): StockAlert[] {
    const products = this.repo.getAllProducts();
    const alerts: StockAlert[] = [];

    for (const prod of products) {
      const currentStock = Number(prod.stock || 0);
      const minStock = Number(prod.minStock || 0);
      if (minStock > 0 && currentStock <= minStock) {
        alerts.push({
          product: prod,
          currentStock,
          minStock,
          isLowStock: true,
        });
      }
    }

    return alerts;
  }

  /**
   * Compute total inventory valuation based on purchasePrice and selling price.
   */
  getInventoryValuation(): InventoryValuation {
    const products = this.repo.getAllProducts();
    let totalQuantity = 0;
    let totalCostValue = 0;
    let totalRetailValue = 0;

    for (const prod of products) {
      const qty = Math.max(0, Number(prod.stock || 0));
      const cost = Number(prod.purchasePrice || prod.price || 0);
      const price = Number(prod.price || 0);

      totalQuantity += qty;
      totalCostValue += qty * cost;
      totalRetailValue += qty * price;
    }

    return {
      totalItems: products.length,
      totalQuantity,
      totalCostValue,
      totalRetailValue,
    };
  }

  /**
   * Adjust product stock level.
   */
  adjustStock(productId: string, quantityDelta: number): Product | null {
    const prod = this.repo.getProductById(productId);
    if (!prod) return null;

    const currentStock = Number(prod.stock || 0);
    const updatedStock = Math.max(0, currentStock + quantityDelta);
    const updated = {
      ...prod,
      stock: updatedStock,
      updatedAt: new Date().toISOString(),
    };

    this.repo.saveProduct(updated);
    return updated;
  }
}

export const inventoryService = new InventoryService();
