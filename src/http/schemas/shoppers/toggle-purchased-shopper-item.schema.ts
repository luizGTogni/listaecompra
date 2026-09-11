import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const togglePurchasedShopperItemResponseSchema = {
  200: z.object({
    shopperItem: z.object({
      id: z.uuid(),
      shopperListId: z.string(),
      title: z.string(),
      description: z.string(),
      quantity: z.number(),
      purchasedAt: z.date().nullable(),
      createdAt: z.date()
    })
  }),
  400: zodErrorSchema,
  404: errorSchema,
  500: errorSchema
}

export const togglePurchasedShopperItemParamsSchema = z.object({
  shopperListId: z.string(),
  shopperItemId: z.string()
})
