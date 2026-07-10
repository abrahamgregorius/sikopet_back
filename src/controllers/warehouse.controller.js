import { warehouseService } from '../services/warehouse/index.js';

export class WarehouseController {
  async list(req, res, next) {
    try {
      const result = await warehouseService.list(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const result = await warehouseService.get(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await warehouseService.create(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await warehouseService.update(req.params.id, req.validated.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getStock(req, res, next) {
    try {
      const result = await warehouseService.getStock(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async listRacks(req, res, next) {
    try {
      const result = await warehouseService.listRacks(req.query.warehouseId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createRack(req, res, next) {
    try {
      const result = await warehouseService.createRack(req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createReceipt(req, res, next) {
    try {
      const result = await warehouseService.createGoodsReceipt(req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createTransfer(req, res, next) {
    try {
      const result = await warehouseService.createTransfer(req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMutations(req, res, next) {
    try {
      const result = await warehouseService.getMutations(req.params.warehouseId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async listStockOpnames(req, res, next) {
    try {
      const result = await warehouseService.listStockOpnames(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getStockOpname(req, res, next) {
    try {
      const result = await warehouseService.getStockOpname(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createStockOpname(req, res, next) {
    try {
      const result = await warehouseService.createStockOpname(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async submitStockOpname(req, res, next) {
    try {
      const result = await warehouseService.submitStockOpname(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async approveStockOpname(req, res, next) {
    try {
      const result = await warehouseService.approveStockOpname(req.params.id, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async rejectStockOpname(req, res, next) {
    try {
      const result = await warehouseService.rejectStockOpname(req.params.id, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const warehouseController = new WarehouseController();
