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
import { FindOneShopperItemService } from './find-one-shopper-item.service.js'

let userRepository: UserRepository
let shopperListRepository: ShopperListRepository
let shopperItemRepository: ShopperItemRepository
let sut: FindOneShopperItemService

let user: User
let shopperListCreated: ShopperList
let shopperItemCreated: ShopperItem

describe('Find One Shopper Item', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    shopperListRepository = new InMemoryShopperListRepository()
    shopperItemRepository = new InMemoryShopperItemRepository()
    sut = new FindOneShopperItemService(
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

    shopperItemCreated = await shopperItemRepository.create({
      title: 'TestShopperItem1',
      description: 'DescriptionShopperItem1',
      quantity: 2,
      shopperListId: shopperListCreated.id
    })
  })

  it('should be able to find one shopper item', async () => {
    const { shopperItem } = await sut.execute({
      userId: user.id,
      shopperListId: shopperListCreated.id,
      shopperItemId: shopperItemCreated.id
    })

    expect(shopperItem).toEqual({
      ...shopperItemCreated,
      shopperList: {
        userId: shopperListCreated.userId,
        title: shopperListCreated.title,
        description: shopperListCreated.description,
        closedAt: shopperListCreated.closedAt
      }
    })
  })

  it('should not be able to add item in shopper item if user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found',
        shopperListId: shopperListCreated.id,
        shopperItemId: shopperItemCreated.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to add item in shopper item if shopper list not found', async () => {
    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: 'shopper-list-not-found',
        shopperItemId: shopperItemCreated.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to add item in shopper item if shopper item not found', async () => {
    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: shopperListCreated.id,
        shopperItemId: 'shopper-item-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
