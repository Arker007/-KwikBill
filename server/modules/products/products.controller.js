import { productsService } from './products.service.js';

export class ProductsController {
  constructor(service = productsService) {
    this.service = service;
  }

  getProducts = (req, res, next) => {
    try {
      const products = this.service.listProducts();
      res.json(products);
    } catch (err) {
      next(err);
    }
  };

  getProduct = (req, res, next) => {
    try {
      const product = this.service.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (err) {
      next(err);
    }
  };

  saveProduct = (req, res, next) => {
    try {
      const payload = { ...req.body };
      if (req.params.id && !payload.id) {
        payload.id = req.params.id;
      }
      const result = this.service.saveProduct(payload);
      res.json(result);
    } catch (err) {
      if (err.statusCode === 400) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  };

  deleteProduct = (req, res, next) => {
    try {
      const result = this.service.deleteProduct(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const productsController = new ProductsController();
