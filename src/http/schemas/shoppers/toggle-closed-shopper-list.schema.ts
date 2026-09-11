import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const toggleClosedShopperListResponseSchema = {
  200: z.object({
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
  500: errorSchema
}

export const toggleClosedShopperListParamsSchema = z.object({
  shopperListId: z.string()
})
