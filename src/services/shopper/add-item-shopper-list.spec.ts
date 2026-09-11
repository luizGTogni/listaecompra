import { ShopperList } from '@/domain/shopper-list.entity.js'
import { User } from '@/domain/user.entity.js'
import { InvalidItemQuantityError } from '@/http/types/errors/invalid-item-quantity.error.js'
import { ResourceAlreadyExistsError } from '@/http/types/errors/resource-already-exists.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { InMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { InMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { AddItemShopperListService } from './add-item-shopper-list.service.js'

let userRepository: UserRepository
let shopperListRepository: ShopperListRepository
let shopperItemRepository: ShopperItemRepository
let sut: AddItemShopperListService

let user: User
let shopperList: ShopperList

describe('Add Item Shopper List', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    shopperListRepository = new InMemoryShopperListRepository()
    shopperItemRepository = new InMemoryShopperItemRepository()
    sut = new AddItemShopperListService(
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
  })

  it('should be able to add item in shopper list', async () => {
    const dataShopperItem = {
      title: 'ItemTest',
      description: 'ItemDescriptionTest',
      quantity: 2
    }

    const { shopperItem } = await sut.execute({
      shopperListId: shopperList.id,
      userId: user.id,
      title: dataShopperItem.title,
      description: dataShopperItem.description,
      quantity: dataShopperItem.quantity
    })

    expect(shopperItem).toEqual({
      id: expect.any(String),
      shopperListId: shopperList.id,
      title: dataShopperItem.title,
      description: dataShopperItem.description,
      quantity: dataShopperItem.quantity,
      purchasedAt: null,
      createdAt: expect.any(Date)
    })
  })

  it('should be able to add item in shopper list with description empty', async () => {
    const dataShopperItem = {
      title: 'ItemTest',
      description: '',
      quantity: 2
    }

    const { shopperItem } = await sut.execute({
      shopperListId: shopperList.id,
      userId: user.id,
      title: dataShopperItem.title,
      description: dataShopperItem.description,
      quantity: dataShopperItem.quantity
    })

    expect(shopperItem).toEqual({
      id: expect.any(String),
      shopperListId: shopperList.id,
      title: dataShopperItem.title,
      description: dataShopperItem.description,
      quantity: dataShopperItem.quantity,
      purchasedAt: null,
      createdAt: expect.any(Date)
    })
  })

  it('should not be able to add item shopper list if shopper list already closed', async () => {
    await shopperListRepository.update({
      ...shopperList,
      closedAt: new Date()
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: shopperList.id,
        title: 'ItemTest',
        description: '',
        quantity: 2
      })
    ).rejects.toBeInstanceOf(ShopperListClosedError)
  })

  it('should not be able to add item in shopper list if user not found', async () => {
    const dataShopperItem = {
      title: 'ItemTest',
      description: '',
      quantity: 2
    }

    await expect(() =>
      sut.execute({
        shopperListId: shopperList.id,
        userId: 'user-not-found',
        title: dataShopperItem.title,
        description: dataShopperItem.description,
        quantity: dataShopperItem.quantity
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should be able to add item in shopper list if shopper list not found', async () => {
    const dataShopperItem = {
      title: 'ItemTest',
      description: '',
      quantity: 2
    }

    await expect(() =>
      sut.execute({
        shopperListId: 'shopper-list-not-found',
        userId: user.id,
        title: dataShopperItem.title,
        description: dataShopperItem.description,
        quantity: dataShopperItem.quantity
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to add item in shopper list if shopper item title already exists', async () => {
    const dataShopperItem = {
      title: 'ItemTest',
      description: 'ItemDescriptionTest',
      quantity: 2
    }

    await sut.execute({
      shopperListId: shopperList.id,
      userId: user.id,
      title: dataShopperItem.title,
      description: dataShopperItem.description,
      quantity: dataShopperItem.quantity
    })

    await expect(() =>
      sut.execute({
        shopperListId: shopperList.id,
        userId: user.id,
        title: dataShopperItem.title,
        description: 'test description 2',
        quantity: dataShopperItem.quantity
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })

  it('should not be able to add item in shopper list if quantity less than or equal 0', async () => {
    const dataShopperItem = {
      title: 'ItemTest',
      description: 'ItemDescriptionTest',
      quantity: 0
    }

    await expect(() =>
      sut.execute({
        shopperListId: shopperList.id,
        userId: user.id,
        title: dataShopperItem.title,
        description: dataShopperItem.description,
        quantity: dataShopperItem.quantity
      })
    ).rejects.toBeInstanceOf(InvalidItemQuantityError)
  })
})
