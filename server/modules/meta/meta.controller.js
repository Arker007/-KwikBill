import { metaService } from './meta.service.js';

export class MetaController {
  /**
   * @param {import('./meta.service.js').MetaService} [service]
   */
  constructor(service) {
    this.service = service || metaService;
  }

  getByKey = (req, res, next) => {
    try {
      const result = this.service.getMeta(req.params.key);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  setByKey = (req, res, next) => {
    try {
      const result = this.service.setMeta(req.params.key, req.body.value);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  increment = (req, res, next) => {
    try {
      const result = this.service.incrementMeta(req.params.key);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const metaController = new MetaController();
