import { z } from 'zod';

export const createSavingsAccountSchema = z.object({
  body: z.object({
    memberId: z.string(),
    type: z.enum(['pokok', 'wajib', 'sukarela']),
  }),
});

export const depositSchema = z.object({
  body: z.object({
    savingsAccountId: z.string(),
    amount: z.number().positive(),
    description: z.string().optional(),
    receiptNumber: z.string(),
  }),
});

export const withdrawSchema = z.object({
  body: z.object({
    savingsAccountId: z.string(),
    amount: z.number().positive(),
    description: z.string().optional(),
    receiptNumber: z.string(),
  }),
});
