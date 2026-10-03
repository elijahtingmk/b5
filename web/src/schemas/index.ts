import { z } from 'zod';

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
