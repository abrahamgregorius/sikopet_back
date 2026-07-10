import { Router } from 'express';
import { dashboardController, notificationController } from '../controllers/dashboard.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Dashboard
router.get('/dashboard/summary', auth, (req, res, next) => dashboardController.summary(req, res, next));
router.get('/dashboard/pmo/koperasi', auth, requireRole('pmo', 'admin'), (req, res, next) => dashboardController.pmoCooperatives(req, res, next));
router.get('/dashboard/ba/conflicts', auth, requireRole('ba'), (req, res, next) => dashboardController.baConflicts(req, res, next));
router.get('/rules/latest', auth, (req, res, next) => dashboardController.latestRules(req, res, next));

// Notifications
router.get('/notifications', auth, (req, res, next) => notificationController.list(req, res, next));
router.put('/notifications/:id/read', auth, (req, res, next) => notificationController.markRead(req, res, next));

export default router;
