import { z } from 'zod'

export const paramsSchema = z.object({
  shopperListId: z.string()
})
