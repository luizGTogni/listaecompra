import { makeAcceptShopperListInviteService } from '@/http/factories/make-accept-shopper-list-invite-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { acceptShopperListInviteParamsSchema } from '@/http/schemas/shopper-members/accept-shopper-list-invite.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function acceptShopperListInviteController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sub } = userAuthSchema.parse(request.user)
  const { shopperListId, memberId } = acceptShopperListInviteParamsSchema.parse(
    request.params
  )

  const acceptShopperListInviteService = makeAcceptShopperListInviteService()

  const { shopperListMember } = await acceptShopperListInviteService.execute({
    requesterId: sub,
    shopperListId,
    memberId
  })

  return reply.status(200).send({ shopperListMember })
}
