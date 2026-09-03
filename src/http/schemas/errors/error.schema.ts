import { z } from 'zod'

export const errorSchema = z.object({
  name: z.string(),
  message: z.string()
})
