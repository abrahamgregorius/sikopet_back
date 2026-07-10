import { z } from 'zod';

export const createVehicleSchema = z.object({
  body: z.object({
    plateNumber: z.string().min(1),
    type: z.string().optional(),
    capacityKg: z.number().optional(),
  }),
});

export const updateVehicleSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    type: z.string().optional(),
    capacityKg: z.number().optional(),
    status: z.enum(['active', 'maintenance', 'inactive']).optional(),
  }),
});

export const createDriverSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    licenseNumber: z.string().min(1),
    phone: z.string().optional(),
  }),
});

export const updateDriverSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const createDeliverySchema = z.object({
  body: z.object({
    vehicleId: z.string(),
    driverId: z.string(),
    date: z.string().optional(),
    origin: z.string().optional(),
    destination: z.string().optional(),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().positive(),
      reference: z.string().optional(),
    })).optional(),
  }),
});

export const updateDeliverySchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    date: z.string().optional(),
    origin: z.string().optional(),
    destination: z.string().optional(),
  }),
});

export const createTrackingSchema = z.object({
  body: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export const createProofSchema = z.object({
  body: z.object({
    recipientName: z.string(),
    signatureUrl: z.string().optional(),
  }),
});
