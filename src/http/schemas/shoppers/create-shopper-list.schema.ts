import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const createShopperListResponseSchema = {
  201: z.object({
    shopperList: z.object({
      id: z.uuid(),
      userId: z.string(),
      title: z.string(),
      description: z.string(),
      closedAt: z.date().nullable(),
      createdAt: z.date()
    })
  }),
  400: zodErrorSchema,
  404: errorSchema,
  409: errorSchema,
  500: errorSchema
}

export const createShopperListBodySchema = z.object({
  title: z.string(),
  description: z.string().default('')
})
