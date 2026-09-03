import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const resendCodeResponseSchema = {
  204: z.object({}),
  404: errorSchema,
  400: zodErrorSchema,
  500: errorSchema
}

export const resendCodeAuthorizationSchema = z.object({
  sub: z.string()
})
