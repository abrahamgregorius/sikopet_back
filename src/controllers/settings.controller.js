import { settingsService } from '../services/settings/index.js';

export class SettingsController {
  async getAll(req, res, next) {
    try {
      const result = await settingsService.getAll();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const result = await settingsService.get(req.params.key);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async set(req, res, next) {
    try {
      const { value } = req.body;
      const result = await settingsService.set(req.params.key, value);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const settingsController = new SettingsController();
