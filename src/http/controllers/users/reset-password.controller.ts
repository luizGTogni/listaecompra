import { makeResetPasswordService } from '@/http/factories/make-reset-password-service.factory.js'
import { resetPasswordBodySchema } from '@/http/schemas/users/reset-password.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function resetPasswordController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { codeValue, newPassword } = resetPasswordBodySchema.parse(request.body)

  const resetPasswordService = makeResetPasswordService()

  await resetPasswordService.execute({ codeValue, newPassword })

  return reply.status(204).send({})
}
