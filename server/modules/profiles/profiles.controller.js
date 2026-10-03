import { profilesService } from './profiles.service.js';

export class ProfilesController {
  /**
   * @param {import('./profiles.service.js').ProfilesService} [service]
   */
  constructor(service) {
    this.service = service || profilesService;
  }

  getPrimary = (req, res, next) => {
    try {
      const profile = this.service.getPrimaryProfile();
      res.json(profile);
    } catch (err) {
      next(err);
    }
  };

  savePrimary = (req, res, next) => {
    try {
      const result = this.service.savePrimaryProfile(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  list = (req, res, next) => {
    try {
      const profiles = this.service.listProfiles();
      res.json(profiles);
    } catch (err) {
      next(err);
    }
  };

  getById = (req, res, next) => {
    try {
      const profile = this.service.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: 'not-found', message: 'Profile not found' });
      }
      res.json(profile);
    } catch (err) {
      next(err);
    }
  };

  save = (req, res, next) => {
    try {
      const result = this.service.saveProfile(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  delete = (req, res, next) => {
    try {
      const result = this.service.deleteProfile(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const profilesController = new ProfilesController();
