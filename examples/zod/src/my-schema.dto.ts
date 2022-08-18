import { z } from 'zod';

export const MySchema = z.object({
  value: z.string()
});

export type MySchema = z.infer<typeof MySchema>;