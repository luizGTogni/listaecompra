import { makeForgotPasswordService } from '@/http/factories/make-forgot-password-service.factory.js'
import { forgotPasswordBodySchema } from '@/http/schemas/users/forgot-password.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function forgotPasswordController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email } = forgotPasswordBodySchema.parse(request.body)

  const forgotPasswordService = makeForgotPasswordService()

  await forgotPasswordService.execute({ email })

  return reply.status(204).send({})
}
