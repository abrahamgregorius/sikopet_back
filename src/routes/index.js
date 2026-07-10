import { Router } from 'express';
import authRoutes from './auth.routes.js';
import syncRoutes from './sync.routes.js';
import identityRoutes from './identity.routes.js';
import savingsRoutes from './savings.routes.js';
import loansRoutes from './loans.routes.js';
import productsRoutes from './products.routes.js';
import warehouseRoutes from './warehouse.routes.js';
import logisticsRoutes from './logistics.routes.js';
import legalRoutes from './legal.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import settingsRoutes from './settings.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/sync', syncRoutes);
router.use('/', identityRoutes);
router.use('/savings', savingsRoutes);
router.use('/loans', loansRoutes);
router.use('/', productsRoutes);
router.use('/', warehouseRoutes);
router.use('/', logisticsRoutes);
router.use('/', legalRoutes);
router.use('/', dashboardRoutes);
router.use('/', settingsRoutes);

export default router;
