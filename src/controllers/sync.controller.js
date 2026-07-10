import { syncService } from '../services/sync/index.js';

export class SyncController {
  async batch(req, res, next) {
    try {
      const { items } = req.validated.body;
      const result = await syncService.processBatch(items, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async status(req, res, next) {
    try {
      const { clientId } = req.params;
      const result = await syncService.getStatus(clientId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async conflicts(req, res, next) {
    try {
      const result = await syncService.getConflicts();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async resolveConflict(req, res, next) {
    try {
      const { id } = req.params;
      const { resolution } = req.body;
      const result = await syncService.resolveConflict(id, resolution, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const syncController = new SyncController();
