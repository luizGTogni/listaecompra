import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const authResponseSchema = {
  200: z.object({
    token: z.jwt()
  }),
  401: errorSchema,
  400: zodErrorSchema,
  500: errorSchema
}

export const authBodySchema = z.object({
  email: z.email(),
  password: z.string().trim()
})
