import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const createUserResponseSchema = {
  201: z.object({
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
  400: zodErrorSchema,
  500: errorSchema
}

export const createUserBodySchema = z.object({
  name: z.string(),
  username: z
    .string()
    .min(3, 'The username must be at least 3 characters long.')
    .max(20, 'The username must have a maximum of 20 characters.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username contains invalid characters'),
  email: z.email(),
  password: z
    .string()
    .trim()
    .min(3, 'The username must be at least 3 characters long.')
    .max(64, 'The username must have a maximum of 64 characters.')
})
