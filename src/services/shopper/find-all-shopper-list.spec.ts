import { User } from '@/domain/user.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { InMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { FindAllShopperListService } from './find-all-shopper-list.service.js'

let userRepository: UserRepository
let getUserFound: GetUserFoundService
let shopperListRepository: ShopperListRepository
let sut: FindAllShopperListService

let user: User

describe('Find All Shopper List', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    getUserFound = new GetUserFoundService(userRepository)
    shopperListRepository = new InMemoryShopperListRepository()
    sut = new FindAllShopperListService(getUserFound, shopperListRepository)

    user = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      passwordHash: 'hasher-123456'
    })
  })

  it('should be able to find all shopper list', async () => {
    for (let i = 1; i <= 5; i++) {
      await shopperListRepository.create({
        title: `TestShopperList-${i}`,
        description: 'Description',
        userId: user.id
      })
    }

    const { shopperLists } = await sut.execute({
      userId: user.id,
      page: 1,
      query: ''
    })

    expect(shopperLists).toHaveLength(5)
    expect(shopperLists).toEqual([
      expect.objectContaining({ title: 'TestShopperList-1' }),
      expect.objectContaining({ title: 'TestShopperList-2' }),
      expect.objectContaining({ title: 'TestShopperList-3' }),
      expect.objectContaining({ title: 'TestShopperList-4' }),
      expect.objectContaining({ title: 'TestShopperList-5' })
    ])
  })

  it('should be able to find all shopper list with query title', async () => {
    for (let i = 1; i <= 5; i++) {
      await shopperListRepository.create({
        title: `TestShopperList-${i}`,
        description: 'Description',
        userId: user.id
      })
    }

    const { shopperLists } = await sut.execute({
      userId: user.id,
      page: 1,
      query: 'TestShopperList-1'
    })

    expect(shopperLists).toHaveLength(1)
    expect(shopperLists[0].title).toEqual('TestShopperList-1')
  })

  it('should be able to find all shopper list with filter page', async () => {
    for (let i = 1; i <= 12; i++) {
      await shopperListRepository.create({
        title: `TestShopperList-${i}`,
        description: 'Description',
        userId: user.id
      })
    }

    const { shopperLists } = await sut.execute({
      userId: user.id,
      page: 2,
      query: ''
    })

    expect(shopperLists).toHaveLength(2)
    expect(shopperLists).toEqual([
      expect.objectContaining({ title: 'TestShopperList-11' }),
      expect.objectContaining({ title: 'TestShopperList-12' })
    ])
  })

  it('should not be able to add item in shopper list if user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found',
        page: 1,
        query: ''
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
