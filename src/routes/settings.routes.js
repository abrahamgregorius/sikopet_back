import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/settings', auth, (req, res, next) => settingsController.getAll(req, res, next));
router.get('/settings/:key', auth, (req, res, next) => settingsController.get(req, res, next));
router.put('/settings/:key', auth, requireRole('admin'), (req, res, next) => settingsController.set(req, res, next));

export default router;
