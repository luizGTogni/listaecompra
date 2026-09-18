import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { ShopperList } from '@/domain/shopper-list.entity.js'
import { User } from '@/domain/user.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { InMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { InMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { InMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { ShopperListMemberRepository } from '@/repositories/shopper-list-member.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { GetShopperListAccessService } from './get-shopper-list-access.service.js'
import { TogglePurchasedShopperItemService } from './toggle-purchased-shopper-item.service.js'

let userRepository: UserRepository
let getUserFound: GetUserFoundService
let shopperListRepository: ShopperListRepository
let shopperListMemberRepository: ShopperListMemberRepository
let getShopperListAccess: GetShopperListAccessService
let shopperItemRepository: ShopperItemRepository
let sut: TogglePurchasedShopperItemService

let user: User
let shopperList: ShopperList
let shopperItemCreated: ShopperItem

describe('Toggle Purchased Shopper Item', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    getUserFound = new GetUserFoundService(userRepository)
    shopperListRepository = new InMemoryShopperListRepository()
    shopperListMemberRepository = new InMemoryShopperListMemberRepository()
    getShopperListAccess = new GetShopperListAccessService(
      shopperListRepository,
      shopperListMemberRepository
    )
    shopperItemRepository = new InMemoryShopperItemRepository()
    sut = new TogglePurchasedShopperItemService(
      getUserFound,
      getShopperListAccess,
      shopperItemRepository
    )

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-01T10:00:00Z'))

    user = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      passwordHash: 'hasher-123456'
    })

    shopperList = await shopperListRepository.create({
      userId: user.id,
      title: 'ListTest',
      description: 'ListTest Description'
    })

    shopperItemCreated = await shopperItemRepository.create({
      shopperListId: shopperList.id,
      title: 'ItemTest',
      description: 'ItemDescriptionTest',
      quantity: 2
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to toggle purchased shopper item for purchased', async () => {
    vi.setSystemTime('2026-09-01T10:40:00Z')

    const { shopperItem } = await sut.execute({
      userId: user.id,
      shopperListId: shopperList.id,
      shopperItemId: shopperItemCreated.id
    })

    const shopperItemUpdated =
      await shopperItemRepository.findByIdAndShopperListId(
        shopperItem.id,
        shopperList.id
      )

    expect(shopperItem).toEqual({
      ...shopperItemCreated,
      purchasedAt: new Date('2026-09-01T10:40:00Z')
    })
    expect(shopperItem).toEqual(shopperItemUpdated)
  })

  it('should be able to toggle purchased shopper item for not purchased', async () => {
    vi.setSystemTime('2026-09-01T10:40:00Z')

    await shopperItemRepository.update({
      ...shopperItemCreated,
      purchasedAt: new Date()
    })

    const { shopperItem } = await sut.execute({
      userId: user.id,
      shopperListId: shopperList.id,
      shopperItemId: shopperItemCreated.id
    })

    const shopperItemUpdated =
      await shopperItemRepository.findByIdAndShopperListId(
        shopperItem.id,
        shopperList.id
      )

    expect(shopperItem).toEqual(shopperItemUpdated)
    expect(shopperItem).toEqual({
      ...shopperItemCreated,
      purchasedAt: null
    })
  })

  it('should be able to toggle purchased shopper item if member with accepted invite', async () => {
    const member = await userRepository.create({
      name: 'Susan Doe',
      username: 'susandoe',
      email: 'susandoe@example.com',
      passwordHash: 'hasher-123456'
    })

    const shopperListMember = await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: member.id
    })

    await shopperListMemberRepository.update({
      ...shopperListMember,
      acceptedAt: new Date()
    })

    const { shopperItem } = await sut.execute({
      userId: member.id,
      shopperListId: shopperList.id,
      shopperItemId: shopperItemCreated.id
    })

    expect(shopperItem.purchasedAt).toBeTruthy()
  })

  it('should not be able to toggle purchased shopper item if member with pending invite', async () => {
    const member = await userRepository.create({
      name: 'Susan Doe',
      username: 'susandoe',
      email: 'susandoe@example.com',
      passwordHash: 'hasher-123456'
    })

    await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: member.id
    })

    await expect(() =>
      sut.execute({
        userId: member.id,
        shopperListId: shopperList.id,
        shopperItemId: shopperItemCreated.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to toggle purchased shopper item if user not member', async () => {
    const userNotAccess = await userRepository.create({
      name: 'Warner Doe',
      username: 'warnerdoe',
      email: 'warnerdoe@example.com',
      passwordHash: 'hasher-123456'
    })

    await expect(() =>
      sut.execute({
        userId: userNotAccess.id,
        shopperListId: shopperList.id,
        shopperItemId: shopperItemCreated.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to toggle purchased shopper item quantity if shopper list already closed', async () => {
    await shopperListRepository.update({
      ...shopperList,
      closedAt: new Date()
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: shopperList.id,
        shopperItemId: shopperItemCreated.id
      })
    ).rejects.toBeInstanceOf(ShopperListClosedError)
  })

  it('should not be able to toggle purchased shopper item if user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found',
        shopperListId: shopperList.id,
        shopperItemId: shopperItemCreated.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to rchased shopper item if shopper list not found', async () => {
    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: 'shopper-list-not-found',
        shopperItemId: shopperItemCreated.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to rchased shopper item if shopper item not found', async () => {
    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: shopperList.id,
        shopperItemId: 'shopper-item-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
