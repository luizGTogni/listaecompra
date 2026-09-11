import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const findOneShopperItemResponseSchema = {
  200: z.object({
    shopperItem: z.object({
      id: z.string(),
      shopperListId: z.string(),
      title: z.string(),
      description: z.string(),
      quantity: z.number(),
      purchasedAt: z.date().nullable(),
      createdAt: z.date(),
      shopperList: z.object({
        userId: z.string(),
        title: z.string(),
        description: z.string(),
        closedAt: z.date().nullable()
      })
    })
  }),
  400: zodErrorSchema,
  404: errorSchema,
  500: errorSchema
}

export const findOneShopperItemParamsSchema = z.object({
  shopperListId: z.string(),
  shopperItemId: z.string()
})
