import { Router } from 'express';
import { vehicleController, driverController, deliveryController } from '../controllers/logistics.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import {
  createVehicleSchema,
  updateVehicleSchema,
  createDriverSchema,
  updateDriverSchema,
  createDeliverySchema,
  updateDeliverySchema,
  createTrackingSchema,
  createProofSchema,
} from '../services/logistics/schemas.js';

const router = Router();

// Vehicles
router.get('/vehicles', auth, (req, res, next) => vehicleController.list(req, res, next));
router.post('/vehicles', auth, validate(createVehicleSchema), (req, res, next) => vehicleController.create(req, res, next));
router.put('/vehicles/:id', auth, validate(updateVehicleSchema), (req, res, next) => vehicleController.update(req, res, next));

// Drivers
router.get('/drivers', auth, (req, res, next) => driverController.list(req, res, next));
router.post('/drivers', auth, validate(createDriverSchema), (req, res, next) => driverController.create(req, res, next));
router.put('/drivers/:id', auth, validate(updateDriverSchema), (req, res, next) => driverController.update(req, res, next));

// Deliveries
router.get('/deliveries', auth, (req, res, next) => deliveryController.list(req, res, next));
router.get('/deliveries/:id', auth, (req, res, next) => deliveryController.get(req, res, next));
router.post('/deliveries', auth, validate(createDeliverySchema), (req, res, next) => deliveryController.create(req, res, next));
router.put('/deliveries/:id', auth, validate(updateDeliverySchema), (req, res, next) => deliveryController.update(req, res, next));
router.post('/deliveries/:id/start', auth, (req, res, next) => deliveryController.start(req, res, next));
router.post('/deliveries/:id/complete', auth, (req, res, next) => deliveryController.complete(req, res, next));
router.post('/deliveries/:id/reschedule', auth, (req, res, next) => deliveryController.reschedule(req, res, next));
router.get('/deliveries/conflicts', auth, requireRole('ba', 'pmo'), (req, res, next) => deliveryController.conflicts(req, res, next));
router.post('/deliveries/:id/tracking', auth, validate(createTrackingSchema), (req, res, next) => deliveryController.tracking(req, res, next));
router.post('/deliveries/:id/proof', auth, validate(createProofSchema), (req, res, next) => deliveryController.proof(req, res, next));

export default router;
