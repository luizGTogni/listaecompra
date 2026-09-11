import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { ShopperList } from '@/domain/shopper-list.entity.js'
import { User } from '@/domain/user.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { InMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { InMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { RemoveItemShopperListService } from './remove-item-shopper-list.service.js'

let userRepository: UserRepository
let shopperListRepository: ShopperListRepository
let shopperItemRepository: ShopperItemRepository
let sut: RemoveItemShopperListService

let user: User
let shopperList: ShopperList
let shopperItem: ShopperItem

describe('Remove Item Shopper List', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    shopperListRepository = new InMemoryShopperListRepository()
    shopperItemRepository = new InMemoryShopperItemRepository()
    sut = new RemoveItemShopperListService(
      userRepository,
      shopperListRepository,
      shopperItemRepository
    )

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

    shopperItem = await shopperItemRepository.create({
      shopperListId: shopperList.id,
      title: 'ItemTest',
      description: 'ItemDescriptionTest',
      quantity: 2
    })
  })

  it('should be able to add item in shopper list', async () => {
    let shopperItems = await shopperItemRepository.findAllByShopperListId(
      shopperList.id
    )

    expect(shopperItems).toHaveLength(1)

    await sut.execute({
      userId: user.id,
      shopperListId: shopperList.id,
      shopperItemId: shopperItem.id
    })

    shopperItems = await shopperItemRepository.findAllByShopperListId(
      shopperList.id
    )

    expect(shopperItems).toHaveLength(0)
  })

  it('should not be able to remove item shopper list if shopper list already closed', async () => {
    await shopperListRepository.update({
      ...shopperList,
      closedAt: new Date()
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: shopperList.id,
        shopperItemId: shopperItem.id
      })
    ).rejects.toBeInstanceOf(ShopperListClosedError)
  })

  it('should not be able to add item in shopper list if user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found',
        shopperListId: shopperList.id,
        shopperItemId: shopperItem.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to add item in shopper list if shopper list not found', async () => {
    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: 'shopper-list-not-found',
        shopperItemId: shopperItem.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to add item in shopper list if shopper item not found', async () => {
    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: shopperList.id,
        shopperItemId: 'shopper-item-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
