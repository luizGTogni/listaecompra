import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { ShopperList } from '@/domain/shopper-list.entity.js'
import { User } from '@/domain/user.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { InMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { InMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { FindOneShopperListService } from './find-one-shopper-list.service.js'

let userRepository: UserRepository
let shopperListRepository: ShopperListRepository
let shopperItemRepository: ShopperItemRepository
let sut: FindOneShopperListService

let user: User
let shopperListCreated: ShopperList
let shopperItem1: ShopperItem
let shopperItem2: ShopperItem

describe('Find One Shopper List', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    shopperListRepository = new InMemoryShopperListRepository()
    shopperItemRepository = new InMemoryShopperItemRepository()
    sut = new FindOneShopperListService(
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

    shopperListCreated = await shopperListRepository.create({
      title: `TestShopperList`,
      description: 'Description',
      userId: user.id
    })

    shopperItem1 = await shopperItemRepository.create({
      title: 'TestShopperItem1',
      description: 'DescriptionShopperItem1',
      quantity: 2,
      shopperListId: shopperListCreated.id
    })

    shopperItem2 = await shopperItemRepository.create({
      title: 'TestShopperItem2',
      description: 'DescriptionShopperItem2',
      quantity: 2,
      shopperListId: shopperListCreated.id
    })
  })

  it('should be able to find one shopper list', async () => {
    const { shopperList } = await sut.execute({
      userId: user.id,
      shopperListId: shopperListCreated.id
    })

    expect(shopperList).toEqual({
      ...shopperListCreated,
      items: [shopperItem1, shopperItem2]
    })
  })

  it('should not be able to add item in shopper list if user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found',
        shopperListId: shopperListCreated.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to add item in shopper list if shopper list not found', async () => {
    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: 'shopper-list-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
