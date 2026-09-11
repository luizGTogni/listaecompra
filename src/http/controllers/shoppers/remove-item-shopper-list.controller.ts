import { makeRemoveItemShopperListService } from '@/http/factories/make-remove-item-shopper-list-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { removeItemShopperListParamsSchema } from '@/http/schemas/shoppers/remove-item-shopper-list.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function removeItemShopperListController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { shopperItemId, shopperListId } =
    removeItemShopperListParamsSchema.parse(request.params)
  const { sub } = userAuthSchema.parse(request.user)

  const removeItemShopperListService = makeRemoveItemShopperListService()

  await removeItemShopperListService.execute({
    shopperItemId,
    shopperListId,
    userId: sub
  })

  return reply.status(204).send({})
}
