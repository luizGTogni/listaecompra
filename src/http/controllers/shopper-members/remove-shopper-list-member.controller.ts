import { makeRemoveShopperListMemberService } from '@/http/factories/make-remove-shopper-list-member-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { removeShopperListMemberParamsSchema } from '@/http/schemas/shopper-members/remove-shopper-list-member.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function removeShopperListMemberController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sub } = userAuthSchema.parse(request.user)
  const { shopperListId, memberId } = removeShopperListMemberParamsSchema.parse(
    request.params
  )

  const removeShopperListMemberService = makeRemoveShopperListMemberService()

  await removeShopperListMemberService.execute({
    requesterId: sub,
    shopperListId,
    memberId
  })

  return reply.status(204).send({})
}
