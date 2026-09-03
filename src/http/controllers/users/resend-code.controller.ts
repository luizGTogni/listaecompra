import { makeCreateCodeService } from '@/http/factories/make-create-code-service.factory.js'
import { resendCodeAuthorizationSchema } from '@/http/schemas/users/resend-code.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function resendCodeController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sub } = resendCodeAuthorizationSchema.parse(request.user)

  const createCodeService = makeCreateCodeService()

  await createCodeService.execute({ userId: sub })

  reply.status(204).send({})
}
