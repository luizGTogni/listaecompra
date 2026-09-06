import { z } from 'zod'

export const userAuthSchema = z.object({
  sub: z.string()
})
