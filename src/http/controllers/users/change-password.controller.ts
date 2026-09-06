import { makeChangePasswordService } from '@/http/factories/make-change-password-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { changePasswordBodySchema } from '@/http/schemas/users/change-password.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function changePasswordController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { currentPassword, newPassword } = changePasswordBodySchema.parse(
    request.body
  )
  const { sub } = userAuthSchema.parse(request.user)

  const changePasswordService = makeChangePasswordService()

  await changePasswordService.execute({
    userId: sub,
    currentPassword,
    newPassword
  })

  return reply.status(204).send({})
}
