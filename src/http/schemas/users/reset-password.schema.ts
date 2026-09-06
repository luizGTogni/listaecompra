import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const resetPasswordResponseSchema = {
  204: z.object({}),
  400: zodErrorSchema,
  404: errorSchema,
  500: errorSchema
}

export const resetPasswordBodySchema = z.object({
  codeValue: z.string().trim().min(6).max(6),
  newPassword: z
    .string()
    .trim()
    .min(3, 'The password must be at least 3 characters long.')
    .max(64, 'The password must have a maximum of 64 characters.')
})
