import { z } from 'zod'

export const healthResponseSchema = {
  200: z.object({
    status: z.string()
  })
}
