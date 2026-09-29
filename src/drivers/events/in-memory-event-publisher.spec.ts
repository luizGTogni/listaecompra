import { ShopperListEvent } from './event-publisher.driver.js'
import { InMemoryEventPublisherDriver } from './in-memory-event-publisher.driver.js'

let sut: InMemoryEventPublisherDriver

describe('In Memory Event Publisher', () => {
  beforeEach(() => {
    sut = new InMemoryEventPublisherDriver()
  })

  it('should be able receive the event publish if subscribe', () => {
    const event: ShopperListEvent = {
      type: 'item-added',
      actorId: 'actor-id',
      itemId: 'item-id'
    }

    const listener = vi.fn()
    sut.subscribe('test-event', listener)
    sut.publish('test-event', event)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(event)
  })

  it('should not be able receive the event publish if subscribe in other channel', () => {
    const event: ShopperListEvent = {
      type: 'item-added',
      actorId: 'actor-id',
      itemId: 'item-id'
    }

    const listener = vi.fn()
    sut.subscribe('test-event', listener)
    sut.publish('other-test-event', event)

    expect(listener).toHaveBeenCalledTimes(0)
  })

  it('should not be able receive the event publish if unsubscribe', () => {
    const event: ShopperListEvent = {
      type: 'item-added',
      actorId: 'actor-id',
      itemId: 'item-id'
    }

    const listener = vi.fn()
    const unsubscribe = sut.subscribe('test-event', listener)
    unsubscribe()

    sut.publish('test-event', event)

    expect(listener).toHaveBeenCalledTimes(0)
  })
})
