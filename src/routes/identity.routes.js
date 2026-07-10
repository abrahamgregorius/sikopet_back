import { Router } from 'express';
import { cooperativeController, memberController, userController } from '../controllers/identity.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import {
  createCooperativeSchema,
  createMemberSchema,
  updateMemberSchema,
  createUserSchema,
  updateUserSchema,
  paginationSchema,
} from '../services/identity/schemas.js';

const router = Router();

// Cooperatives
router.get('/cooperatives', auth, validate(paginationSchema), (req, res, next) => cooperativeController.list(req, res, next));
router.get('/cooperatives/:id', auth, (req, res, next) => cooperativeController.get(req, res, next));
router.post('/cooperatives', auth, requireRole('admin'), validate(createCooperativeSchema), (req, res, next) => cooperativeController.create(req, res, next));

// Members
router.get('/members', auth, validate(paginationSchema), (req, res, next) => memberController.list(req, res, next));
router.get('/members/:id', auth, (req, res, next) => memberController.get(req, res, next));
router.post('/members', auth, validate(createMemberSchema), (req, res, next) => memberController.create(req, res, next));
router.put('/members/:id', auth, validate(updateMemberSchema), (req, res, next) => memberController.update(req, res, next));

// Users
router.get('/users', auth, validate(paginationSchema), (req, res, next) => userController.list(req, res, next));
router.get('/users/:id', auth, (req, res, next) => userController.get(req, res, next));
router.post('/users', auth, requireRole('admin'), validate(createUserSchema), (req, res, next) => userController.create(req, res, next));
router.put('/users/:id', auth, requireRole('admin'), validate(updateUserSchema), (req, res, next) => userController.update(req, res, next));

export default router;
