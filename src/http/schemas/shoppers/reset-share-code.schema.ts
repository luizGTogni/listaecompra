import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const resetShareCodeResponseSchema = {
  200: z.object({
    shopperList: z.object({
      id: z.uuid(),
      userId: z.string(),
      shareCode: z.string(),
      title: z.string(),
      description: z.string(),
      closedAt: z.date().nullable(),
      createdAt: z.date()
    })
  }),
  400: zodErrorSchema,
  401: errorSchema,
  403: errorSchema,
  404: errorSchema,
  409: errorSchema,
  500: errorSchema
}

export const resetShareCodeParamsSchema = z.object({
  shopperListId: z.string()
})
