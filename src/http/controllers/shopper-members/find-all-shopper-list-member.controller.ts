import { makeFindAllShopperListMemberService } from '@/http/factories/make-find-all-shopper-list-member-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { findAllShopperListMemberParamsSchema } from '@/http/schemas/shopper-members/find-all-shopper-list-member.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function findAllShopperListMemberController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sub } = userAuthSchema.parse(request.user)
  const { shopperListId } = findAllShopperListMemberParamsSchema.parse(
    request.params
  )

  const findAllShopperListMemberService = makeFindAllShopperListMemberService()

  const { shopperListMembers } = await findAllShopperListMemberService.execute({
    userId: sub,
    shopperListId
  })

  return reply.status(200).send({ shopperListMembers })
}
