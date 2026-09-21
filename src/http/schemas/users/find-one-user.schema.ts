import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const findOneUserResponseSchema = {
  200: z.object({
    user: z.object({
      id: z.uuid(),
      name: z.string(),
      username: z.string(),
      verifiedAt: z.date().nullable(),
      email: z.email(),
      createdAt: z.date()
    })
  }),
  409: errorSchema,
  400: z.union([zodErrorSchema, errorSchema]),
  500: errorSchema
}
