import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { ShopperList } from '@/domain/shopper-list.entity.js'
import { User } from '@/domain/user.entity.js'
import { InvalidItemQuantityError } from '@/http/types/errors/invalid-item-quantity.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperItemAlreadyPurchasedError } from '@/http/types/errors/shopper-item-already-purchased.error.js'
import { InMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { InMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { UpdateShopperItemQuantityService } from './update-shopper-item-quantity.service.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js';

let userRepository: UserRepository
let shopperListRepository: ShopperListRepository
let shopperItemRepository: ShopperItemRepository
let sut: UpdateShopperItemQuantityService

let user: User
let shopperList: ShopperList
let shopperItemCreated: ShopperItem

describe('Toggle Purchased Shopper Item', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    shopperListRepository = new InMemoryShopperListRepository()
    shopperItemRepository = new InMemoryShopperItemRepository()
    sut = new UpdateShopperItemQuantityService(
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

    shopperItemCreated = await shopperItemRepository.create({
      shopperListId: shopperList.id,
      title: 'ItemTest',
      description: 'ItemDescriptionTest',
      quantity: 2
    })
  })

  it('should be able to update shopper item quantity greater than', async () => {
    const { shopperItem } = await sut.execute({
      userId: user.id,
      shopperListId: shopperList.id,
      shopperItemId: shopperItemCreated.id,
      quantity: 3
    })

    const shopperItemUpdated =
      await shopperItemRepository.findByIdAndShopperListId(
        shopperItem.id,
        shopperList.id
      )

    expect(shopperItem).toEqual({
      ...shopperItemCreated,
      quantity: 3
    })
    expect(shopperItem).toEqual(shopperItemUpdated)
  })

  it('should be able to update shopper item quantity less than', async () => {
    const { shopperItem } = await sut.execute({
      userId: user.id,
      shopperListId: shopperList.id,
      shopperItemId: shopperItemCreated.id,
      quantity: 1
    })

    const shopperItemUpdated =
      await shopperItemRepository.findByIdAndShopperListId(
        shopperItem.id,
        shopperList.id
      )

    expect(shopperItem).toEqual({
      ...shopperItemCreated,
      quantity: 1
    })
    expect(shopperItem).toEqual(shopperItemUpdated)
  })

  it('should be able to update shopper item quantity equal', async () => {
    const { shopperItem } = await sut.execute({
      userId: user.id,
      shopperListId: shopperList.id,
      shopperItemId: shopperItemCreated.id,
      quantity: 2
    })

    const shopperItemUpdated =
      await shopperItemRepository.findByIdAndShopperListId(
        shopperItem.id,
        shopperList.id
      )

    expect(shopperItem).toEqual({
      ...shopperItemCreated,
      quantity: 2
    })
    expect(shopperItem).toEqual(shopperItemUpdated)
  })

  it('should be able to delete shopper item when quantity equal 0', async () => {
    const { shopperItem } = await sut.execute({
      userId: user.id,
      shopperListId: shopperList.id,
      shopperItemId: shopperItemCreated.id,
      quantity: 0
    })

    const shopperItemUpdated =
      await shopperItemRepository.findByIdAndShopperListId(
        shopperItem.id,
        shopperList.id
      )

    expect(shopperItemUpdated).toBeFalsy()
  })

  it('should not be able to update shopper item quantity if user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found',
        shopperListId: shopperList.id,
        shopperItemId: shopperItemCreated.id,
        quantity: 3
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update shopper item quantity if shopper list already closed', async () => {
    await shopperListRepository.update({
      ...shopperList,
      closedAt: new Date()
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: shopperList.id,
        shopperItemId: shopperItemCreated.id,
        quantity: 3
      })
    ).rejects.toBeInstanceOf(ShopperListClosedError)
  })

  it('should not be able to rchased shopper item if shopper list not found', async () => {
    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: 'shopper-list-not-found',
        shopperItemId: shopperItemCreated.id,
        quantity: 3
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to rchased shopper item if shopper item not found', async () => {
    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: shopperList.id,
        shopperItemId: 'shopper-item-not-found',
        quantity: 3
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to rchased shopper item if shopper item not found', async () => {
    await shopperItemRepository.update({
      ...shopperItemCreated,
      purchasedAt: new Date()
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: shopperList.id,
        shopperItemId: shopperItemCreated.id,
        quantity: 3
      })
    ).rejects.toBeInstanceOf(ShopperItemAlreadyPurchasedError)
  })

  it('should not be able to rchased shopper item if quantity less than 0', async () => {
    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: shopperList.id,
        shopperItemId: shopperItemCreated.id,
        quantity: -1
      })
    ).rejects.toBeInstanceOf(InvalidItemQuantityError)
  })
})
