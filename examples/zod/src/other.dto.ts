import { z } from 'zod';

export const Other = z.object({
  nested: z.object({
    key: z.optional(z.array(z.number()))
  })
});

export type Other = z.infer<typeof Other>;