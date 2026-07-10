import { Router } from 'express';
import { productController, supplierController, stockController, saleController, purchaseController } from '../controllers/products.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import {
  createProductSchema,
  updateProductSchema,
  createSupplierSchema,
  createSaleSchema,
  createPurchaseSchema,
} from '../services/products/schemas.js';

const router = Router();

// Products
router.get('/products', auth, (req, res, next) => productController.list(req, res, next));
router.get('/products/:id', auth, (req, res, next) => productController.get(req, res, next));
router.get('/products/barcode/:barcode', auth, (req, res, next) => productController.getByBarcode(req, res, next));
router.post('/products', auth, validate(createProductSchema), (req, res, next) => productController.create(req, res, next));
router.put('/products/:id', auth, validate(updateProductSchema), (req, res, next) => productController.update(req, res, next));
router.get('/products/low-stock', auth, (req, res, next) => productController.lowStock(req, res, next));

// Suppliers
router.get('/suppliers', auth, (req, res, next) => supplierController.list(req, res, next));
router.post('/suppliers', auth, validate(createSupplierSchema), (req, res, next) => supplierController.create(req, res, next));

// Stock
router.get('/stock', auth, (req, res, next) => stockController.list(req, res, next));
router.get('/stock/:productId', auth, (req, res, next) => stockController.get(req, res, next));

// Sales
router.get('/sales', auth, (req, res, next) => saleController.list(req, res, next));
router.get('/sales/:id', auth, (req, res, next) => saleController.get(req, res, next));
router.post('/sales', auth, validate(createSaleSchema), (req, res, next) => saleController.create(req, res, next));
router.get('/sales/oversell', auth, requireRole('ba'), (req, res, next) => saleController.oversell(req, res, next));
router.post('/sales/:id/resolve-oversell', auth, requireRole('ba'), (req, res, next) => saleController.resolveOversell(req, res, next));

// Purchases
router.get('/purchases', auth, (req, res, next) => purchaseController.list(req, res, next));
router.post('/purchases', auth, validate(createPurchaseSchema), (req, res, next) => purchaseController.create(req, res, next));

export default router;
