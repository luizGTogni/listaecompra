import { makeDeleteShopperListService } from '@/http/factories/make-delete-shopper-list-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { deleteShopperListParamsSchema } from '@/http/schemas/shoppers/delete-shopper-list.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function deleteShopperListController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { shopperListId } = deleteShopperListParamsSchema.parse(request.params)
  const { sub } = userAuthSchema.parse(request.user)

  const deleteShopperListService = makeDeleteShopperListService()

  await deleteShopperListService.execute({
    shopperListId,
    userId: sub
  })

  return reply.status(204).send({})
}
