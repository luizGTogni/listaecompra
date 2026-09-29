import { Redis } from 'ioredis'
import { env } from '@/config/env.js'
import {
  EventListener,
  EventPublisherDriver,
  ShopperListEvent
} from './event-publisher.driver.js'

export class RedisEventPublisherDriver implements EventPublisherDriver {
  // keepAlive envia pacotes de TCP keep-alive, para o Upstash (e outros
  // provedores) não derrubarem a conexão por ficar ociosa. ioredis já
  // reconecta sozinho quando a conexão cai, mas sem um listener de
  // 'error' ele registra "Unhandled error event" a cada queda.
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
