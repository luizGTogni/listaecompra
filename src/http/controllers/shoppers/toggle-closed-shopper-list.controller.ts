import { makeToggleClosedShopperListService } from '@/http/factories/make-toggle-closed-shopper-list-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { toggleClosedShopperListParamsSchema } from '@/http/schemas/shoppers/toggle-closed-shopper-list.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function toggleClosedShopperListController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { shopperListId } = toggleClosedShopperListParamsSchema.parse(
    request.params
  )
  const { sub } = userAuthSchema.parse(request.user)

  const toggleClosedShopperListService = makeToggleClosedShopperListService()

  const { shopperList } = await toggleClosedShopperListService.execute({
    shopperListId,
    userId: sub
  })

  return reply.status(200).send({ shopperList })
}
