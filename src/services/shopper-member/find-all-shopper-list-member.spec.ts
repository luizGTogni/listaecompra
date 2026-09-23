import { ShopperListMember } from '@/domain/shopper-list-member.entity.js'
import { ShopperList } from '@/domain/shopper-list.entity.js'
import { User } from '@/domain/user.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { InMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { InMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { ShopperListMemberRepository } from '@/repositories/shopper-list-member.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { GetShopperListAccessService } from '../shopper/get-shopper-list-access.service.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { FindAllShopperListMemberService } from './find-all-shopper-list-member.service.js'

let userRepository: UserRepository
let getUserFound: GetUserFoundService
let shopperListRepository: ShopperListRepository
let shopperListMemberRepository: ShopperListMemberRepository
let getShopperListAccess: GetShopperListAccessService
let sut: FindAllShopperListMemberService

let user1: User
let user2: User
let user3: User
let user4: User
let userNotAccess: User
let shopperList: ShopperList
let shopperListEmpty: ShopperList
let shopperListMember1: ShopperListMember
let shopperListMember2: ShopperListMember
let shopperListMember3: ShopperListMember
let expectedMembers: Array<
  ShopperListMember & { user: { name: string; username: string } }
>

describe('Find All Shopper List Member', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    getUserFound = new GetUserFoundService(userRepository)
    shopperListRepository = new InMemoryShopperListRepository(userRepository)
    shopperListMemberRepository = new InMemoryShopperListMemberRepository(
      shopperListRepository,
      userRepository
    )
    getShopperListAccess = new GetShopperListAccessService(
      shopperListRepository,
      shopperListMemberRepository
    )
    sut = new FindAllShopperListMemberService(
      getUserFound,
      getShopperListAccess,
      shopperListMemberRepository
    )

    user1 = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      passwordHash: 'hasher-123456'
    })

    user2 = await userRepository.create({
      name: 'Susan Doe',
      username: 'susandoe',
      email: 'susandoe@example.com',
      passwordHash: 'hasher-123456'
    })

    user3 = await userRepository.create({
      name: 'Doug Doe',
      username: 'dougdoe',
      email: 'dougdoe@example.com',
      passwordHash: 'hasher-123456'
    })

    userNotAccess = await userRepository.create({
      name: 'Warner Doe',
      username: 'warnerdoe',
      email: 'warnerdoe@example.com',
      passwordHash: 'hasher-123456'
    })

    user4 = await userRepository.create({
      name: 'Ana Doe',
      username: 'anadoe',
      email: 'anadoe@example.com',
      passwordHash: 'hasher-123456'
    })

    shopperList = await shopperListRepository.create({
      userId: user1.id,
      title: 'ListTest',
      description: 'ListTest Description'
    })

    shopperListEmpty = await shopperListRepository.create({
      userId: user1.id,
      title: 'ListTestEmpty',
      description: 'ListTest Description'
    })

    shopperListMember1 = await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    shopperListMember2 = await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: user3.id
    })

    shopperListMember3 = await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: user4.id
    })

    shopperListMember2 = await shopperListMemberRepository.update({
      ...shopperListMember2,
      acceptedAt: new Date()
    })

    shopperListMember3 = await shopperListMemberRepository.update({
      ...shopperListMember3,
      acceptedAt: new Date()
    })

    expectedMembers = [
      {
        ...shopperListMember1,
        user: { name: user2.name, username: user2.username }
      },
      {
        ...shopperListMember2,
        user: { name: user3.name, username: user3.username }
      },
      {
        ...shopperListMember3,
        user: { name: user4.name, username: user4.username }
      }
    ]
  })

  it('should be able to find all shopper list member if owner', async () => {
    const { shopperListMembers } = await sut.execute({
      shopperListId: shopperList.id,
      userId: user1.id
    })

    expect(shopperListMembers).toHaveLength(3)
    expect(shopperListMembers).toEqual(expectedMembers)
  })

  it('should be able to find all shopper list member if member', async () => {
    const { shopperListMembers } = await sut.execute({
      shopperListId: shopperList.id,
      userId: user3.id
    })

    expect(shopperListMembers).toHaveLength(3)
    expect(shopperListMembers).toEqual(expectedMembers)
  })

  it('should be able to find all shopper list member empty', async () => {
    const { shopperListMembers } = await sut.execute({
      shopperListId: shopperListEmpty.id,
      userId: user1.id
    })

    expect(shopperListMembers).toHaveLength(0)
    expect(shopperListMembers).toEqual([])
  })

  it('should not be able to find all shopper list member if user not access', async () => {
    await expect(() =>
      sut.execute({
        shopperListId: shopperList.id,
        userId: userNotAccess.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to find all shopper list member if shopper list not found', async () => {
    await expect(() =>
      sut.execute({
        shopperListId: 'shopper-list-not-found',
        userId: user2.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to find all shopper list member if user not found', async () => {
    await expect(() =>
      sut.execute({
        shopperListId: shopperList.id,
        userId: 'user-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
