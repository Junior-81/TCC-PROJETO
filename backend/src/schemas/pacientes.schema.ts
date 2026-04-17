import { z } from 'zod';

export const pacienteParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});
