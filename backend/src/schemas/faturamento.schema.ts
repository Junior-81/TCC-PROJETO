import { z } from 'zod';

export const faturamentoQuerySchema = z.object({
  mes: z.coerce.number().int().min(1).max(12),
  ano: z.coerce.number().int().min(1000).max(9999)
});
