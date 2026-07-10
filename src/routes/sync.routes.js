import { Router } from 'express';
import { syncController } from '../controllers/sync.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { syncBatchSchema } from '../services/sync/schemas.js';

const router = Router();

router.post('/batch', auth, validate(syncBatchSchema), (req, res, next) => syncController.batch(req, res, next));
router.get('/status/:clientId', auth, (req, res, next) => syncController.status(req, res, next));
router.get('/conflicts', auth, requireRole('ba', 'pmo'), (req, res, next) => syncController.conflicts(req, res, next));
router.post('/conflicts/:id/resolve', auth, requireRole('ba', 'pmo'), (req, res, next) => syncController.resolveConflict(req, res, next));

export default router;
