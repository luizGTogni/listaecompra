import { makeAuthService } from '@/http/factories/make-auth-service.factory.js'
import { makeCreateTokenService } from '@/http/factories/make-create-token-service.factory.js'
import { authBodySchema } from '@/http/schemas/users/auth.schema.js'
import { setSessionCookie } from '@/http/utils/session-cookie.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function authController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email, password } = authBodySchema.parse(request.body)

  const authService = makeAuthService()

  const { user } = await authService.execute({ email, passwordPlain: password })

  const createTokenService = makeCreateTokenService()

  const { token } = await createTokenService.execute({ user })

  setSessionCookie(reply, token)

  return reply.status(204).send()
}
