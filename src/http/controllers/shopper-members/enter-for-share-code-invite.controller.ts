import { makeEnterForShareCodeInviteService } from '@/http/factories/make-enter-for-share-code-invite-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { enterForShareCodeInviteBodySchema } from '@/http/schemas/shopper-members/enter-for-share-code-invite.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function enterForShareCodeInviteController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sub } = userAuthSchema.parse(request.user)
  const { shareCode } = enterForShareCodeInviteBodySchema.parse(request.body)

  const enterForShareCodeInviteService = makeEnterForShareCodeInviteService()

  const { shopperListMember } = await enterForShareCodeInviteService.execute({
    userId: sub,
    shareCode
  })

  return reply.status(201).send({ shopperListMember })
}
