import { makeCreateShopperListInviteService } from '@/http/factories/make-create-shopper-list-invite-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import {
  createShopperListInviteBodySchema,
  createShopperListInviteParamsSchema
} from '@/http/schemas/shopper-members/create-shopper-list-invite.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function createShopperListInviteController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sub } = userAuthSchema.parse(request.user)
  const { username } = createShopperListInviteBodySchema.parse(request.body)
  const { shopperListId } = createShopperListInviteParamsSchema.parse(
    request.params
  )

  const createShopperListInviteService = makeCreateShopperListInviteService()

  const { shopperListMember } = await createShopperListInviteService.execute({
    userId: sub,
    shopperListId,
    username
  })

  return reply.status(201).send({ shopperListMember })
}
