import { clearSessionCookie } from '@/http/utils/session-cookie.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function logoutController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  clearSessionCookie(reply)

  reply.status(204).send({})
}
