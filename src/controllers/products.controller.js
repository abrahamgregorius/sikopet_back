import { productService, supplierService, stockService, saleService, purchaseService } from '../services/products/index.js';

export class ProductController {
  async list(req, res, next) {
    try {
      const result = await productService.list(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const result = await productService.get(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getByBarcode(req, res, next) {
    try {
      const result = await productService.getByBarcode(req.params.barcode);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await productService.create(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await productService.update(req.params.id, req.validated.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async lowStock(req, res, next) {
    try {
      const result = await productService.lowStock(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export class SupplierController {
  async list(req, res, next) {
    try {
      const result = await supplierService.list(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await supplierService.create(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export class StockController {
  async list(req, res, next) {
    try {
      const result = await stockService.list(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const result = await stockService.get(req.params.productId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export class SaleController {
  async list(req, res, next) {
    try {
      const result = await saleService.list(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const result = await saleService.get(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await saleService.create(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async oversell(req, res, next) {
    try {
      const result = await saleService.oversell();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async resolveOversell(req, res, next) {
    try {
      const result = await saleService.resolveOversell(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export class PurchaseController {
  async list(req, res, next) {
    try {
      const result = await purchaseService.list(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await purchaseService.create(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
export const supplierController = new SupplierController();
export const stockController = new StockController();
export const saleController = new SaleController();
export const purchaseController = new PurchaseController();
