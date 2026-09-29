import { env } from '@/config/env.js'
import { EventPublisherDriver } from '@/drivers/events/event-publisher.driver.js'
import { InMemoryEventPublisherDriver } from '@/drivers/events/in-memory-event-publisher.driver.js'
import { RedisEventPublisherDriver } from '@/drivers/events/redis-event-publisher.driver.js'

const eventPublisher: EventPublisherDriver =
  env.NODE_ENV === 'test'
    ? new InMemoryEventPublisherDriver()
    : new RedisEventPublisherDriver()

export function makeEventPublisher(): EventPublisherDriver {
  return eventPublisher
}
