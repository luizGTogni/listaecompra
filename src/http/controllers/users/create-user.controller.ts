import { makeCreateUserService } from '@/http/factories/make-create-user-service.factory.js'
import { createUserBodySchema } from '@/http/schemas/users/create-user.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function createUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = createUserBodySchema.parse(request.body)

  const createUserService = makeCreateUserService()

  const { user } = await createUserService.execute({
    ...body,
    passwordPlain: body.password
  })

  return reply.status(201).send({
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
