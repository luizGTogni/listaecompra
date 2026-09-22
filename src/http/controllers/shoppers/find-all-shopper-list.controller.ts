import { makeFindAllShopperListService } from '@/http/factories/make-find-all-shopper-list-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { findAllShopperListQuerySchema } from '@/http/schemas/shoppers/find-all-shopper-list.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function findAllShopperListController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { page, limit, query, status } = findAllShopperListQuerySchema.parse(
    request.query
  )
  const { sub } = userAuthSchema.parse(request.user)

  const findAllShopperListService = makeFindAllShopperListService()

  const response = await findAllShopperListService.execute({
    userId: sub,
    page,
    limit,
    query,
    status
  })

  return reply.status(200).send(response)
}
