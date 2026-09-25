import {
  applyShopperListAiProposalController,
  chatShopperListAiController
} from '@/http/controllers/ai/ai.controller.js'
import {
  applyShopperListAiProposalBodySchema,
  applyShopperListAiProposalResponseSchema,
  chatShopperListAiBodySchema,
  chatShopperListAiResponseSchema
} from '@/http/schemas/ai/ai.schema.js'
import { withAuth } from '@/http/schemas/auth/with-auth.schema.js'
import { FastifyInstance } from 'fastify'

export async function verifiedAiRoutes(app: FastifyInstance) {
  app.post(
    '/ai/chat',
    {
      // Every message costs a model call: much tighter than the global limit.
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
      schema: withAuth({
        tags: ['AI'],
        summary: 'Chat about a shopper list',
        description:
          'Sends the conversation to the AI and returns its reply plus a proposal of changes, which is not applied.',
        body: chatShopperListAiBodySchema,
        response: chatShopperListAiResponseSchema
      })
    },
    chatShopperListAiController
  )

  app.post(
    '/ai/apply',
    {
      schema: withAuth({
        tags: ['AI'],
        summary: 'Apply an AI proposal',
        description:
          'Creates a list from the proposal, or changes an existing one.',
        body: applyShopperListAiProposalBodySchema,
        response: applyShopperListAiProposalResponseSchema
      })
    },
    applyShopperListAiProposalController
  )
}
