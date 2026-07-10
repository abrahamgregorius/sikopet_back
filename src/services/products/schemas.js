import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    category: z.string().optional(),
    name: z.string().min(1),
    unit: z.string().optional(),
    purchasePrice: z.number().optional(),
    salePrice: z.number().optional(),
    barcode: z.string().optional(),
    minimumStock: z.number().int().nonnegative().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    category: z.string().optional(),
    name: z.string().min(1).optional(),
    unit: z.string().optional(),
    purchasePrice: z.number().optional(),
    salePrice: z.number().optional(),
    barcode: z.string().optional(),
    minimumStock: z.number().int().nonnegative().optional(),
  }),
});

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    contact: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const createSaleSchema = z.object({
  body: z.object({
    totalAmount: z.number().positive(),
    paymentMethod: z.enum(['cash', 'card', 'transfer']).optional(),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      subtotal: z.number().positive(),
    })),
  }),
});

export const createPurchaseSchema = z.object({
  body: z.object({
    supplierId: z.string(),
    totalAmount: z.number().positive(),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      subtotal: z.number().positive(),
    })),
  }),
});
