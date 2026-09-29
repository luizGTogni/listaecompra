import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'

export const streamShopperListEventsResponseSchema = {
  401: errorSchema,
  404: errorSchema
}

export const streamShopperListEventsParamsSchema = z.object({
  shopperListId: z.string()
})
