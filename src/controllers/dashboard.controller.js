import { dashboardService, notificationService } from '../services/dashboard/index.js';

export class DashboardController {
  async summary(req, res, next) {
    try {
      const result = await dashboardService.summary(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async pmoCooperatives(req, res, next) {
    try {
      const result = await dashboardService.pmoCooperatives();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async baConflicts(req, res, next) {
    try {
      const result = await dashboardService.baConflicts();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async latestRules(req, res, next) {
    try {
      const result = await dashboardService.getLatestRules();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export class NotificationController {
  async list(req, res, next) {
    try {
      const result = await notificationService.list(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async markRead(req, res, next) {
    try {
      const result = await notificationService.markRead(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
export const notificationController = new NotificationController();
