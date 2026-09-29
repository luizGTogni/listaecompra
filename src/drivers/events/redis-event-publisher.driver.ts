import { Redis } from 'ioredis'
import { env } from '@/config/env.js'
import {
  EventListener,
  EventPublisherDriver,
  ShopperListEvent
} from './event-publisher.driver.js'

// Provedores como o Upstash colocam um proxy na frente do Redis, que
// corta a conexão se não vir NENHUM comando por um tempo. Isso é
// invisível ao TCP keep-alive (o keep-alive fica entre o socket e o
// próximo salto de rede, o proxy nem participa dele). Por isso mandamos
// um PING de verdade de tempos em tempos, sempre antes daquele timeout.
//
// Medido em produção: o proxy do Upstash estava derrubando a conexão a
// cada ~25s, e um PING a cada 30s chegava um passo atrás. 15s dá folga
// suficiente.
const PING_INTERVAL_MS = 15_000

export class RedisEventPublisherDriver implements EventPublisherDriver {
  private publisherClient = new Redis(env.REDIS_URL, { keepAlive: 10_000 })
  private subscriberClient = new Redis(env.REDIS_URL, { keepAlive: 10_000 })

  private listenersByChannel = new Map<string, Set<EventListener>>()

  constructor() {
    this.publisherClient.on('error', (error) => {
      console.error('[RedisEventPublisherDriver] publisher error', error)
    })

    this.subscriberClient.on('error', (error) => {
      console.error('[RedisEventPublisherDriver] subscriber error', error)
    })

    const pingInterval = setInterval(() => {
      this.publisherClient.ping().catch(() => {})
      // PING é um dos poucos comandos que o protocolo Redis permite numa
      // conexão em modo subscriber, então isso não interfere nas
      // assinaturas ativas.
      this.subscriberClient.ping().catch(() => {})
    }, PING_INTERVAL_MS)

    // .unref() não impede o processo de encerrar por causa deste timer.
    pingInterval.unref()

    this.subscriberClient.on('message', (channel, message) => {
      const listeners = this.listenersByChannel.get(channel)

      if (!listeners) {
        return
      }

      const event: ShopperListEvent = JSON.parse(message)

      for (const listener of listeners) {
        listener(event)
      }
    })
  }

  publish(channel: string, event: ShopperListEvent) {
    this.publisherClient.publish(channel, JSON.stringify(event))
  }

  subscribe(channel: string, listener: EventListener) {
    const listeners = this.listenersByChannel.get(channel)

    if (!listeners) {
      this.listenersByChannel.set(channel, new Set([listener]))
      this.subscriberClient.subscribe(channel)
    } else {
      listeners.add(listener)
    }

    return () => {
      const currentListeners = this.listenersByChannel.get(channel)

      if (!currentListeners) {
        return
      }

      currentListeners.delete(listener)

      if (currentListeners.size === 0) {
        this.listenersByChannel.delete(channel)
        this.subscriberClient.unsubscribe(channel)
      }
    }
  }
}
