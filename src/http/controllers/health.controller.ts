import { FastifyReply, FastifyRequest } from 'fastify'

export async function healthController(_: FastifyRequest, reply: FastifyReply) {
  return reply.status(200).send({
    status: 'ok'
  })
}
