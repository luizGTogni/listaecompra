import { makeFindOneShopperItemService } from '@/http/factories/make-find-one-shopper-item-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { findOneShopperItemParamsSchema } from '@/http/schemas/shoppers/find-one-shopper-item.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function findOneShopperItemController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { shopperListId, shopperItemId } = findOneShopperItemParamsSchema.parse(
    request.params
  )
  const { sub } = userAuthSchema.parse(request.user)

  const findOneShopperItemService = makeFindOneShopperItemService()

  const { shopperItem } = await findOneShopperItemService.execute({
    userId: sub,
    shopperListId,
    shopperItemId
  })

  return reply.status(200).send({ shopperItem })
}
