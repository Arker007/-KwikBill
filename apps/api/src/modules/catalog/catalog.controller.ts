import type { Request, Response, NextFunction } from 'express';
import { CatalogService, catalogService } from './catalog.service.ts';

export class CatalogController {
  private service: CatalogService;

  constructor(service?: CatalogService) {
    this.service = service || catalogService;
  }

  getProducts = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const products = this.service.listProducts();
      res.json(products);
    } catch (err) {
      next(err);
    }
  };

  getProduct = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const product = this.service.getProduct(req.params.id);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(product);
    } catch (err) {
      next(err);
    }
  };

  saveProduct = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const payload = { ...req.body };
      if (req.params.id && !payload.id) {
        payload.id = req.params.id;
      }
      const result = this.service.saveProduct(payload);
      res.json(result);
    } catch (err: any) {
      if (err.statusCode === 400) {
        res.status(400).json({ error: err.message });
        return;
      }
      next(err);
    }
  };

  deleteProduct = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.deleteProduct(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const catalogController = new CatalogController();
export const productsController = catalogController;
