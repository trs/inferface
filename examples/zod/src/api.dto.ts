import { z } from 'zod';

export const MyApiSchema = z.object({
  value: z.string()
});

export type MyApiSchema = z.infer<typeof MyApiSchema>;