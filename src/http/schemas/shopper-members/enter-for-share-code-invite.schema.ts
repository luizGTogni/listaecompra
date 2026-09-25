import { z } from 'zod'
import { errorSchema } from '../errors/error.schema.js'
import { zodErrorSchema } from '../errors/zod-error.schema.js'

export const enterForShareCodeInviteResponseSchema = {
  201: z.object({
    shopperListMember: z.object({
      memberId: z.string(),
      shopperListId: z.string(),
      acceptedAt: z.date().nullable(),
      invitedAt: z.date()
    })
  }),
  400: z.union([zodErrorSchema, errorSchema]),
  401: errorSchema,
  403: errorSchema,
  404: errorSchema,
  409: errorSchema,
  500: errorSchema
}

export const enterForShareCodeInviteBodySchema = z.object({
  shareCode: z.string()
})
