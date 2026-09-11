import { makeAddItemShopperListService } from '@/http/factories/make-add-item-shopper-list-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import {
  addItemShopperListBodySchema,
  addItemShopperListParamsSchema
} from '@/http/schemas/shoppers/add-item-shopper-list.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function addItemShopperListController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { title, description, quantity } = addItemShopperListBodySchema.parse(
    request.body
  )
  const { shopperListId } = addItemShopperListParamsSchema.parse(request.params)

  const { sub } = userAuthSchema.parse(request.user)

  const addItemShopperListService = makeAddItemShopperListService()

  const { shopperItem } = await addItemShopperListService.execute({
    title,
    description,
    quantity,
    shopperListId,
    userId: sub
  })

  return reply.status(201).send({ shopperItem })
}
