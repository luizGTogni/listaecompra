import { makeEventPublisher } from '@/http/factories/make-event-publisher.factory.js'
import { makeGetShopperListAccessService } from '@/http/factories/make-get-shopper-list-access-service.factory.js'
import { userAuthSchema } from '@/http/schemas/auth/user-auth.schema.js'
import { paramsSchema } from '@/http/schemas/shoppers/params.schema.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function streamShopperListEventsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sub } = userAuthSchema.parse(request.user)
  const { shopperListId } = paramsSchema.parse(request.params)

  const getShopperListAccessService = makeGetShopperListAccessService()

  const shopperList = await getShopperListAccessService.execute({
    shopperListId,
    userId: sub
  })

  reply.hijack()

  for (const [key, value] of Object.entries(reply.getHeaders())) {
    if (value !== undefined) {
      reply.raw.setHeader(key, value)
    }
  }

  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  })

  reply.raw.flushHeaders()

  const eventPublisher = makeEventPublisher()

  const unsubscribe = eventPublisher.subscribe(
    `list:${shopperList.id}`,
    (event) => {
      const isListDeleted = event.type === 'list-deleted'
      const isMemberCurrentRemoved =
        event.type === 'member-removed' && event.memberId === sub

      if (isListDeleted || isMemberCurrentRemoved) {
        reply.raw.end()
        return
      }

      reply.raw.write(
        `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
      )
    }
  )

  const timer = setInterval(() => reply.raw.write(': heartbeat\n\n'), 25000)

  reply.raw.on('close', () => {
    unsubscribe()
    clearInterval(timer)
  })
}
