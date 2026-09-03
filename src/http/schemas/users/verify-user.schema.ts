import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const verifyUserResponseSchema = {
  204: z.object({}),
  401: errorSchema,
  404: errorSchema,
  409: errorSchema,
  400: zodErrorSchema,
  500: errorSchema
}

export const verifyUserAuthorizationSchema = z.object({
  sub: z.string()
})

export const verifyUserBodySchema = z.object({
  codeValue: z.string()
})
