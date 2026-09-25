import { makeResetShareCodeService } from '@/http/factories/make-reset-share-code-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { resetShareCodeParamsSchema } from '@/http/schemas/shoppers/reset-share-code.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function resetShareCodeController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { shopperListId } = resetShareCodeParamsSchema.parse(request.params)
  const { sub } = userAuthSchema.parse(request.user)

  const resetShareCodeService = makeResetShareCodeService()

  const { shopperList } = await resetShareCodeService.execute({
    shopperListId,
    userId: sub
  })

  return reply.status(200).send({ shopperList })
}
