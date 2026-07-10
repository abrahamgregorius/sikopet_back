import { z } from 'zod';

export const syncBatchSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      idempotencyKey: z.string(),
      entityType: z.string(),
      operationType: z.enum(['create', 'update', 'delete']),
      clientId: z.string(),
      payload: z.record(z.any()),
      deviceId: z.string(),
    })),
  }),
});
