import { makeCreateShopperListService } from '@/http/factories/make-create-shopper-list-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { createShopperListBodySchema } from '@/http/schemas/shoppers/create-shopper-list.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function createShopperListController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { title, description } = createShopperListBodySchema.parse(request.body)
  const { sub } = userAuthSchema.parse(request.user)

  const createShopperListService = makeCreateShopperListService()

  const { shopperList } = await createShopperListService.execute({
    title,
    description,
    userId: sub
  })

  return reply.status(201).send({ shopperList })
}
