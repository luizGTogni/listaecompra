import {
  makeApplyShopperListAiProposalService,
  makeChatShopperListAiService
} from '@/http/factories/make-ai-services.factory.js'
import {
  applyShopperListAiProposalBodySchema,
  chatShopperListAiBodySchema
} from '@/http/schemas/ai/ai.schema.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function chatShopperListAiController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { shopperListId, messages } = chatShopperListAiBodySchema.parse(
    request.body
  )
  const { sub } = userAuthSchema.parse(request.user)

  const result = await makeChatShopperListAiService().execute({
    userId: sub,
    shopperListId,
    messages
  })

  return reply.status(200).send(result)
}

export async function applyShopperListAiProposalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = applyShopperListAiProposalBodySchema.parse(request.body)
  const { sub } = userAuthSchema.parse(request.user)

  const result = await makeApplyShopperListAiProposalService().execute({
    userId: sub,
    ...body
  })

  return reply.status(200).send(result)
}
