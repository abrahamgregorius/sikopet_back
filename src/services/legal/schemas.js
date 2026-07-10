import { z } from 'zod';

export const profileSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    NIB: z.string().optional(),
    SKAHU: z.string().optional(),
    legalStatus: z.string().optional(),
    modalSimpananPokok: z.number().optional(),
    modalSimpananWajib: z.number().optional(),
  }),
});

export const documentSchema = z.object({
  body: z.object({
    type: z.enum(['akta', 'SKAHU', 'NPWP', 'berita_acara', 'NIB']),
    fileUrl: z.string().optional(),
  }),
});

export const villagePotentialSchema = z.object({
  body: z.object({
    commodity: z.string().min(1),
    areaSize: z.number().optional(),
    volume: z.number().optional(),
    laborCount: z.number().int().optional(),
    estimatedValue: z.number().optional(),
  }),
});

export const outletSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    location: z.string().optional(),
    photo: z.string().optional(),
  }),
});

export const financingRequestSchema = z.object({
  body: z.object({
    type: z.enum(['bank_account', 'business_proposal', 'financing']),
  }),
});

export const articleSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    content: z.string().optional(),
  }),
});
