import { makeFindOneShopperListService } from '@/http/factories/make-find-one-shopper-list-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { findOneShopperListParamsSchema } from '@/http/schemas/shoppers/find-one-shopper-list.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function findOneShopperListController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { shopperListId } = findOneShopperListParamsSchema.parse(request.params)
  const { sub } = userAuthSchema.parse(request.user)

  const findOneShopperListService = makeFindOneShopperListService()

  const { shopperList } = await findOneShopperListService.execute({
    userId: sub,
    shopperListId
  })

  return reply.status(200).send({ shopperList })
}
