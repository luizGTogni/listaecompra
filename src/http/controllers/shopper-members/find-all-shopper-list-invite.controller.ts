import { makeFindAllShopperListInviteService } from '@/http/factories/make-find-all-shopper-list-invite-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function findAllShopperListInviteController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sub } = userAuthSchema.parse(request.user)

  const findAllShopperListInviteService = makeFindAllShopperListInviteService()

  const { shopperListMembers } = await findAllShopperListInviteService.execute({
    userId: sub
  })

  return reply.status(200).send({ shopperListMembers })
}
