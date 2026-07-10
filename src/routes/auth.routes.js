import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, refreshSchema, registerDeviceSchema } from '../services/auth/schemas.js';

const router = Router();

router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/refresh', validate(refreshSchema), (req, res, next) => authController.refresh(req, res, next));
router.post('/logout', auth, (req, res, next) => authController.logout(req, res, next));
router.post('/device/register', auth, validate(registerDeviceSchema), (req, res, next) => authController.registerDevice(req, res, next));

export default router;
