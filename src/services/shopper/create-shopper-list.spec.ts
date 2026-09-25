import { User } from '@/domain/user.entity.js'
import { ResourceAlreadyExistsError } from '@/http/types/errors/resource-already-exists.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { InMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { CreateShopperListService } from './create-shopper-list.service.js'

let userRepository: UserRepository
let getUserFound: GetUserFoundService
let shopperListRepository: ShopperListRepository
let sut: CreateShopperListService

let user: User

describe('Create Shopper List', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    getUserFound = new GetUserFoundService(userRepository)
    shopperListRepository = new InMemoryShopperListRepository()
    sut = new CreateShopperListService(getUserFound, shopperListRepository)

    user = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      passwordHash: 'hasher-123456'
    })
  })

  it('should be able to create shopper list', async () => {
    const dataShopperList = {
      title: 'ListTest',
      description: 'ListTest Description'
    }

    const { shopperList } = await sut.execute({
      userId: user.id,
      title: dataShopperList.title,
      description: dataShopperList.description
    })

    expect(shopperList).toEqual({
      id: expect.any(String),
      userId: user.id,
      shareCode: expect.any(String),
      title: dataShopperList.title,
      description: dataShopperList.description,
      closedAt: null,
      createdAt: expect.any(Date)
    })
  })

  it('should be able to create shopper list with description empty', async () => {
    const dataShopperList = {
      title: 'ListTest',
      description: ''
    }

    const { shopperList } = await sut.execute({
      userId: user.id,
      title: dataShopperList.title,
      description: dataShopperList.description
    })

    expect(shopperList).toEqual({
      id: expect.any(String),
      userId: user.id,
      shareCode: expect.any(String),
      title: dataShopperList.title,
      description: dataShopperList.description,
      closedAt: null,
      createdAt: expect.any(Date)
    })
  })

  it('should not be able to create shopper list if user not found', async () => {
    const dataShopperList = {
      title: 'ListTest',
      description: ''
    }

    await expect(() =>
      sut.execute({
        userId: 'user-not-found',
        title: dataShopperList.title,
        description: dataShopperList.description
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create shopper list if title already exists for that user', async () => {
    const dataShopperList = {
      title: 'ListTest',
      description: ''
    }

    await sut.execute({
      userId: user.id,
      title: dataShopperList.title,
      description: dataShopperList.description
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        title: dataShopperList.title,
        description: 'ListTest Description'
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })
})
