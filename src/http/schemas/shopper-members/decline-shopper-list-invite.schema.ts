import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const declineShopperListInviteResponseSchema = {
  204: z.object({}),
  400: z.union([zodErrorSchema, errorSchema]),
  401: errorSchema,
  403: errorSchema,
  404: errorSchema,
  409: errorSchema,
  500: errorSchema
}

export const declineShopperListInviteParamsSchema = z.object({
  shopperListId: z.string(),
  memberId: z.string()
})
