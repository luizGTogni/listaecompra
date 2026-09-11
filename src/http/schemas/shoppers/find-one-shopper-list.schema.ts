import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const findOneShopperListResponseSchema = {
  200: z.object({
    shopperList: z.object({
      id: z.string(),
      userId: z.string(),
      title: z.string(),
      description: z.string(),
      closedAt: z.date().nullable(),
      createdAt: z.date(),
      items: z.array(
        z.object({
          id: z.string(),
          shopperListId: z.string(),
          title: z.string(),
          description: z.string(),
          quantity: z.number(),
          purchasedAt: z.date().nullable(),
          createdAt: z.date()
        })
      )
    })
  }),
  400: zodErrorSchema,
  404: errorSchema,
  500: errorSchema
}

export const findOneShopperListParamsSchema = z.object({
  shopperListId: z.string()
})
