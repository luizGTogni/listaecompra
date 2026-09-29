import { EventEmitter } from 'events'
import {
  EventListener,
  EventPublisherDriver,
  ShopperListEvent
} from './event-publisher.driver.js'

export class InMemoryEventPublisherDriver implements EventPublisherDriver {
  private emitter = new EventEmitter()

  constructor() {
    this.emitter.setMaxListeners(Infinity)
  }

  publish(channel: string, event: ShopperListEvent) {
    this.emitter.emit(channel, event)
  }

  subscribe(channel: string, listener: EventListener) {
    this.emitter.on(channel, listener)

    return () => {
      this.emitter.off(channel, listener)
    }
  }
}
