import { z } from 'zod';
import { answersPattern } from '@/config/riasec';

export const testSchema = z.object({
  testId: z.string().max(32),
  lang: z.string().max(16),
  invalid: z.boolean(),
  answers: z
    .array(
      z.object({
        id: z.string().max(64),
        score: z.number().int().min(1).max(5),
        domain: z.string().max(8),
        facet: z.number().int().min(1).max(6)
      })
    )
    .nonempty()
    .max(500),
  timeElapsed: z.number().nonnegative(),
  dateStamp: z.coerce.date()
});

export const testId = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid hexadecimal ID')
    .min(24)
    .max(24)
});

export const leadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(200),
  role: z.enum(['hr-osh', 'leader', 'individual']).optional(),
  locale: z.string().max(16).optional(),
  contactConsent: z.literal(true),
  shareResult: z.boolean(),
  resultTest: z.enum(['big5', 'riasec']).default('big5'),
  resultId: z
    .string()
    .regex(/^[0-9a-f]{24}$/)
    .optional()
});

export const riasecSchema = z.object({
  answers: z.string().regex(answersPattern),
  timeElapsed: z
    .number()
    .nonnegative()
    .max(60 * 60 * 24)
});
