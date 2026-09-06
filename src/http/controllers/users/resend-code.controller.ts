import { makeResendCodeService } from '@/http/factories/make-resend-code-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function resendCodeController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sub } = userAuthSchema.parse(request.user)

  const resendCodeService = makeResendCodeService()

  await resendCodeService.execute({ userId: sub })

  reply.status(204).send({})
}
