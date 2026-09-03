import { makeVerifyUserService } from '@/http/factories/make-verify-user-service.factory.js'
import {
  verifyUserAuthorizationSchema,
  verifyUserBodySchema
} from '@/http/schemas/users/verify-user.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sub } = verifyUserAuthorizationSchema.parse(request.user)
  const { codeValue } = verifyUserBodySchema.parse(request.body)

  const verifyUserService = makeVerifyUserService()

  await verifyUserService.execute({ userId: sub, codeValue })

  return reply.status(204).send()
}
