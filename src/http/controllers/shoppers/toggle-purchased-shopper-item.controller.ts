import { makeTogglePurchasedShopperItemService } from '@/http/factories/make-toggle-purchased-shopper-item-service.factory copy.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { togglePurchasedShopperItemParamsSchema } from '@/http/schemas/shoppers/toggle-purchased-shopper-item.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function togglePurchasedShopperItemController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { shopperItemId, shopperListId } =
    togglePurchasedShopperItemParamsSchema.parse(request.params)
  const { sub } = userAuthSchema.parse(request.user)

  const togglePurchasedShopperItemService =
    makeTogglePurchasedShopperItemService()

  const { shopperItem } = await togglePurchasedShopperItemService.execute({
    shopperItemId,
    shopperListId,
    userId: sub
  })

  return reply.status(200).send({ shopperItem })
}
