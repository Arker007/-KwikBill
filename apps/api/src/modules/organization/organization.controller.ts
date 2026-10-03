import type { Request, Response, NextFunction } from 'express';
import { OrganizationService, organizationService } from './organization.service.ts';

export class OrganizationController {
  private service: OrganizationService;

  constructor(service?: OrganizationService) {
    this.service = service || organizationService;
  }

  getPrimary = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const profile = this.service.getPrimaryProfile();
      res.json(profile);
    } catch (err) {
      next(err);
    }
  };

  savePrimary = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.savePrimaryProfile(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  list = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const profiles = this.service.listProfiles();
      res.json(profiles);
    } catch (err) {
      next(err);
    }
  };

  getById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const profile = this.service.getProfile(req.params.id);
      if (!profile) {
        res.status(404).json({ error: 'not-found', message: 'Profile not found' });
        return;
      }
      res.json(profile);
    } catch (err) {
      next(err);
    }
  };

  save = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.saveProfile(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  delete = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.deleteProfile(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const organizationController = new OrganizationController();
