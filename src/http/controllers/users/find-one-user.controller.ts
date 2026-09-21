import { makeFindOneUserService } from '@/http/factories/make-find-one-user-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function findOneUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sub } = userAuthSchema.parse(request.user)

  const findOneUserService = makeFindOneUserService()

  const { user } = await findOneUserService.execute({
    userId: sub
  })

  return reply.status(200).send({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      verifiedAt: user.verifiedAt,
      createdAt: user.createdAt
    }
  })
}
