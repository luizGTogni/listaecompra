import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const removeItemShopperListResponseSchema = {
  204: z.object({}),
  400: zodErrorSchema,
  404: errorSchema,
  500: errorSchema
}

export const removeItemShopperListParamsSchema = z.object({
  shopperListId: z.string(),
  shopperItemId: z.string()
})
