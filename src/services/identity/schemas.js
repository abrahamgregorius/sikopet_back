import { z } from 'zod';

export const createCooperativeSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    phone: z.string().optional(),
    NIB: z.string().optional(),
    SKAHU: z.string().optional(),
    modalSimpananPokok: z.number().optional(),
    modalSimpananWajib: z.number().optional(),
  }),
});

export const createMemberSchema = z.object({
  body: z.object({
    memberNumber: z.string().min(1),
    nik: z.string().min(1),
    name: z.string().min(1),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const updateMemberSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
    role: z.enum(['admin', 'operator', 'ba', 'pmo']),
    cooperativeId: z.string().optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().optional(),
    role: z.enum(['admin', 'operator', 'ba', 'pmo']).optional(),
    cooperativeId: z.string().optional(),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});
