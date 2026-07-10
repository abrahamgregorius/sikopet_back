import { z } from 'zod';

export const createLoanSchema = z.object({
  body: z.object({
    memberId: z.string(),
    principal: z.number().positive(),
    interestRate: z.number().min(0).max(100),
    tenorMonths: z.number().int().positive(),
  }),
});

export const updateLoanSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    principal: z.number().positive().optional(),
    interestRate: z.number().min(0).max(100).optional(),
    tenorMonths: z.number().int().positive().optional(),
    notes: z.string().optional(),
  }),
});

export const approveLoanSchema = z.object({
  body: z.object({
    notes: z.string().optional(),
  }),
});

export const rejectLoanSchema = z.object({
  body: z.object({
    notes: z.string(),
  }),
});

export const disburseLoanSchema = z.object({
  body: z.object({
    disbursementDate: z.string().optional(),
  }),
});

export const paymentSchema = z.object({
  body: z.object({
    installmentScheduleId: z.string(),
    amount: z.number().positive(),
    receiptNumber: z.string(),
  }),
});

export const createDepositSchema = z.object({
  body: z.object({
    memberId: z.string(),
    principal: z.number().positive(),
    tenorMonths: z.number().int().positive(),
    interestRate: z.number().min(0).max(100),
    maturityDate: z.string(),
  }),
});
