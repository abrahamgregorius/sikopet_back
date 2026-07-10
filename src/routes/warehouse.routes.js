import { Router } from 'express';
import { warehouseController } from '../controllers/warehouse.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  createRackSchema,
  createGoodsReceiptSchema,
  createTransferSchema,
  createStockOpnameSchema,
} from '../services/warehouse/schemas.js';

const router = Router();

router.get('/warehouses', auth, (req, res, next) => warehouseController.list(req, res, next));
router.get('/warehouses/:id', auth, (req, res, next) => warehouseController.get(req, res, next));
router.post('/warehouses', auth, validate(createWarehouseSchema), (req, res, next) => warehouseController.create(req, res, next));
router.put('/warehouses/:id', auth, validate(updateWarehouseSchema), (req, res, next) => warehouseController.update(req, res, next));
router.get('/warehouses/:id/stock', auth, (req, res, next) => warehouseController.getStock(req, res, next));

router.get('/warehouse/racks', auth, (req, res, next) => warehouseController.listRacks(req, res, next));
router.post('/warehouse/racks', auth, validate(createRackSchema), (req, res, next) => warehouseController.createRack(req, res, next));
router.post('/warehouse/receipts', auth, validate(createGoodsReceiptSchema), (req, res, next) => warehouseController.createReceipt(req, res, next));
router.post('/warehouse/transfers', auth, validate(createTransferSchema), (req, res, next) => warehouseController.createTransfer(req, res, next));
router.get('/warehouse/mutations/:warehouseId', auth, (req, res, next) => warehouseController.getMutations(req, res, next));

router.get('/stock-opname', auth, (req, res, next) => warehouseController.listStockOpnames(req, res, next));
router.get('/stock-opname/:id', auth, (req, res, next) => warehouseController.getStockOpname(req, res, next));
router.post('/stock-opname', auth, validate(createStockOpnameSchema), (req, res, next) => warehouseController.createStockOpname(req, res, next));
router.post('/stock-opname/:id/submit', auth, (req, res, next) => warehouseController.submitStockOpname(req, res, next));
router.post('/stock-opname/:id/approve', auth, requireRole('ba'), (req, res, next) => warehouseController.approveStockOpname(req, res, next));
router.post('/stock-opname/:id/reject', auth, requireRole('ba'), (req, res, next) => warehouseController.rejectStockOpname(req, res, next));

export default router;
