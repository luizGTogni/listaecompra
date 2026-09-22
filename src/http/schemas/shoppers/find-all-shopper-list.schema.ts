import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const findAllShopperListResponseSchema = {
  200: z.object({
    shopperLists: z.array(
      z.object({
        id: z.string(),
        userId: z.string(),
        title: z.string(),
        description: z.string(),
        closedAt: z.date().nullable(),
        createdAt: z.date()
      })
    ),
    perPage: z.coerce.number(),
    page: z.coerce.number(),
    total: z.coerce.number()
  }),
  400: zodErrorSchema,
  404: errorSchema,
  500: errorSchema
}

export const findAllShopperListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce
    .number()
    .pipe(z.union([z.literal(10), z.literal(25)]))
    .default(10),
  query: z.string().default(''),
  status: z.enum(['open', 'closed']).optional()
})
