import { Redis } from 'ioredis'
import { env } from '@/config/env.js'
import {
  EventListener,
  EventPublisherDriver,
  ShopperListEvent
} from './event-publisher.driver.js'

export class RedisEventPublisherDriver implements EventPublisherDriver {
  private publisherClient = new Redis(env.REDIS_URL)
  private subscriberClient = new Redis(env.REDIS_URL)

  private listenersByChannel = new Map<string, Set<EventListener>>()

  constructor() {
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
