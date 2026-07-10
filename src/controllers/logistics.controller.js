import { vehicleService, driverService, deliveryService } from '../services/logistics/index.js';

export class VehicleController {
  async list(req, res, next) {
    try {
      const result = await vehicleService.list(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await vehicleService.create(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await vehicleService.update(req.params.id, req.validated.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export class DriverController {
  async list(req, res, next) {
    try {
      const result = await driverService.list(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await driverService.create(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await driverService.update(req.params.id, req.validated.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export class DeliveryController {
  async list(req, res, next) {
    try {
      const result = await deliveryService.list(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const result = await deliveryService.get(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await deliveryService.create(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await deliveryService.update(req.params.id, req.validated.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async start(req, res, next) {
    try {
      const result = await deliveryService.start(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async complete(req, res, next) {
    try {
      const result = await deliveryService.complete(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async reschedule(req, res, next) {
    try {
      const result = await deliveryService.reschedule(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async conflicts(req, res, next) {
    try {
      const result = await deliveryService.getConflicts();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async tracking(req, res, next) {
    try {
      const result = await deliveryService.addTracking(req.params.id, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async proof(req, res, next) {
    try {
      const result = await deliveryService.addProof(req.params.id, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const vehicleController = new VehicleController();
export const driverController = new DriverController();
export const deliveryController = new DeliveryController();
