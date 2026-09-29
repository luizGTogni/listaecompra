import { ShopperList } from '@/domain/shopper-list.entity.js'
import { User } from '@/domain/user.entity.js'
import { EventPublisherDriver } from '@/drivers/events/event-publisher.driver.js'
import { InMemoryEventPublisherDriver } from '@/drivers/events/in-memory-event-publisher.driver.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { InMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { InMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { ShopperListMemberRepository } from '@/repositories/shopper-list-member.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { ToggleClosedShopperListService } from './toggle-closed-shopper-list.service.js'

let userRepository: UserRepository
let getUserFound: GetUserFoundService
let shopperListRepository: ShopperListRepository
let shopperListMemberRepository: ShopperListMemberRepository
let eventPublisher: EventPublisherDriver
let sut: ToggleClosedShopperListService

let user: User
let shopperListCreated: ShopperList

describe('Toggle Closed Shopper List', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    getUserFound = new GetUserFoundService(userRepository)
    shopperListRepository = new InMemoryShopperListRepository()
    shopperListMemberRepository = new InMemoryShopperListMemberRepository()
    eventPublisher = new InMemoryEventPublisherDriver()
    sut = new ToggleClosedShopperListService(
      getUserFound,
      shopperListRepository,
      eventPublisher
    )

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-01T10:00:00Z'))

    user = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      passwordHash: 'hasher-123456'
    })

    shopperListCreated = await shopperListRepository.create({
      userId: user.id,
      title: 'ListTest',
      description: 'ListTest Description'
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to toggle closed shopper list for closed', async () => {
    vi.setSystemTime('2026-09-01T10:40:00Z')

    const { shopperList } = await sut.execute({
      userId: user.id,
      shopperListId: shopperListCreated.id
    })

    const shopperItemUpdated = await shopperListRepository.findByIdAndUserId(
      shopperList.id,
      user.id
    )

    expect(shopperList).toEqual({
      ...shopperListCreated,
      closedAt: new Date('2026-09-01T10:40:00Z')
    })
    expect(shopperList).toEqual(shopperItemUpdated)
  })

  it('should be able to toggle closed shopper list for not closed', async () => {
    vi.setSystemTime('2026-09-01T10:40:00Z')

    await shopperListRepository.update({
      ...shopperListCreated,
      closedAt: new Date()
    })

    const { shopperList } = await sut.execute({
      userId: user.id,
      shopperListId: shopperListCreated.id
    })

    const shopperItemUpdated = await shopperListRepository.findByIdAndUserId(
      shopperList.id,
      user.id
    )

    expect(shopperList).toEqual({
      ...shopperListCreated,
      closedAt: null
    })
    expect(shopperList).toEqual(shopperItemUpdated)
  })

  it('should not be able to toggle closed shopper list if user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found',
        shopperListId: shopperListCreated.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to closed shopper list if shopper list not found', async () => {
    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: 'shopper-list-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to toggle closed shopper list if member with accepted invite', async () => {
    const member = await userRepository.create({
      name: 'Susan Doe',
      username: 'susandoe',
      email: 'susandoe@example.com',
      passwordHash: 'hasher-123456'
    })

    const shopperListMember = await shopperListMemberRepository.create({
      shopperListId: shopperListCreated.id,
      memberId: member.id
    })

    await shopperListMemberRepository.update({
      ...shopperListMember,
      acceptedAt: new Date()
    })

    await expect(() =>
      sut.execute({
        userId: member.id,
        shopperListId: shopperListCreated.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should publish list-closed-toggled event when toggle closed', async () => {
    const listener = vi.fn()
    eventPublisher.subscribe(`list:${shopperListCreated.id}`, listener)

    await sut.execute({
      userId: user.id,
      shopperListId: shopperListCreated.id
    })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith({
      type: 'list-closed-toggled',
      actorId: user.id
    })
  })

  it('should not publish event if shopper list not found', async () => {
    const listener = vi.fn()
    eventPublisher.subscribe(`list:${shopperListCreated.id}`, listener)

    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: 'shopper-list-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)

    expect(listener).not.toHaveBeenCalled()
  })
})
