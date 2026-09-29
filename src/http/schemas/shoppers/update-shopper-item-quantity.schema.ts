import { z } from 'zod'
import { itemUnitSchema } from './item-unit.schema.js'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const updateShopperItemQuantityResponseSchema = {
  200: z.object({
    shopperItem: z.object({
      id: z.uuid(),
      shopperListId: z.string(),
      title: z.string(),
      description: z.string(),
      quantity: z.number(),
      unit: itemUnitSchema,
      purchasedAt: z.date().nullable(),
      createdAt: z.date()
    })
  }),
  400: z.union([zodErrorSchema, errorSchema]),
  404: errorSchema,
  500: errorSchema
}

export const updateShopperItemQuantityBodySchema = z.object({
  quantity: z.coerce.number().min(0),
  unit: itemUnitSchema.optional()
})

export const updateShopperItemQuantityParamsSchema = z.object({
  shopperListId: z.string(),
  shopperItemId: z.string()
})
