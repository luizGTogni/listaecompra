import { makeUpdateShopperItemQuantityService } from '@/http/factories/make-update-shopper-item-quantity-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import {
  updateShopperItemQuantityBodySchema,
  updateShopperItemQuantityParamsSchema
} from '@/http/schemas/shoppers/update-shopper-item-quantity.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function updateShopperItemQuantityController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { quantity } = updateShopperItemQuantityBodySchema.parse(request.body)
  const { shopperItemId, shopperListId } =
    updateShopperItemQuantityParamsSchema.parse(request.params)
  const { sub } = userAuthSchema.parse(request.user)

  const updateShopperItemQuantityService =
    makeUpdateShopperItemQuantityService()

  const { shopperItem } = await updateShopperItemQuantityService.execute({
    shopperItemId,
    shopperListId,
    userId: sub,
    quantity
  })

  return reply.status(200).send({ shopperItem })
}
