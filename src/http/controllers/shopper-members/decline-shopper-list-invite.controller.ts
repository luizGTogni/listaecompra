import { makeDeclineShopperListInviteService } from '@/http/factories/make-decline-shopper-list-invite-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { declineShopperListInviteParamsSchema } from '@/http/schemas/shopper-members/decline-shopper-list-invite.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function declineShopperListInviteController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sub } = userAuthSchema.parse(request.user)
  const { shopperListId, memberId } =
    declineShopperListInviteParamsSchema.parse(request.params)

  const declineShopperListInviteService = makeDeclineShopperListInviteService()

  await declineShopperListInviteService.execute({
    requesterId: sub,
    shopperListId,
    memberId
  })

  return reply.status(204).send({})
}
