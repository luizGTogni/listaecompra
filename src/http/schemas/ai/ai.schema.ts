import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const chatShopperListAiBodySchema = z.object({
  shopperListId: z.uuid().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(1000)
      })
    )
    .min(1)
    .max(20)
    .refine((messages) => messages[messages.length - 1].role === 'user', {
      message: 'The last message must come from the user.'
    })
})

export const chatShopperListAiResponseSchema = {
  200: z.object({
    reply: z.string(),
    proposal: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        addItems: z.array(
          z.object({ title: z.string(), quantity: z.number() })
        ),
        removeItems: z.array(z.object({ id: z.string(), title: z.string() }))
      })
      .nullable()
  }),
  400: zodErrorSchema,
  403: errorSchema,
  404: errorSchema,
  409: errorSchema,
  429: errorSchema,
  500: errorSchema,
  503: errorSchema
}

export const applyShopperListAiProposalBodySchema = z.object({
  shopperListId: z.uuid().optional(),
  title: z.string().trim().min(1).max(60).optional(),
  description: z.string().trim().max(200).optional(),
  addItems: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(60),
        quantity: z.coerce.number().int().min(1).max(999)
      })
    )
    .max(40)
    .default([]),
  removeItemIds: z.array(z.string()).max(100).default([])
})

export const applyShopperListAiProposalResponseSchema = {
  200: z.object({
    shopperListId: z.string(),
    added: z.number(),
    removed: z.number()
  }),
  400: zodErrorSchema,
  403: errorSchema,
  404: errorSchema,
  409: errorSchema,
  500: errorSchema
}
