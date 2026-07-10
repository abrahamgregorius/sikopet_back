import { z } from 'zod';

export const createWarehouseSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    location: z.string().optional(),
    capacity: z.number().optional(),
  }),
});

export const updateWarehouseSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().min(1).optional(),
    location: z.string().optional(),
    capacity: z.number().optional(),
  }),
});

export const createRackSchema = z.object({
  body: z.object({
    warehouseId: z.string(),
    rackCode: z.string().min(1),
    capacity: z.number().optional(),
  }),
});

export const createGoodsReceiptSchema = z.object({
  body: z.object({
    warehouseId: z.string(),
    productId: z.string(),
    quantity: z.number().positive(),
    photoUrl: z.string().optional(),
    receiptDate: z.string().optional(),
  }),
});

export const createTransferSchema = z.object({
  body: z.object({
    productId: z.string(),
    warehouseId: z.string(),
    type: z.enum(['in', 'out', 'transfer']),
    destinationWarehouseId: z.string().optional(),
    quantity: z.number().positive(),
    referenceNumber: z.string(),
  }),
});

export const createStockOpnameSchema = z.object({
  body: z.object({
    warehouseId: z.string(),
    items: z.array(z.object({
      productId: z.string(),
      systemQuantity: z.number(),
      physicalQuantity: z.number(),
      difference: z.number(),
    })),
  }),
});
