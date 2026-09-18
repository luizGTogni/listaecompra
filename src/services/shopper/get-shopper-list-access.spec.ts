import { ShopperList } from '@/domain/shopper-list.entity.js'
import { User } from '@/domain/user.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { InMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { InMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { ShopperListMemberRepository } from '@/repositories/shopper-list-member.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { GetShopperListAccessService } from './get-shopper-list-access.service.js'

let userRepository: UserRepository
let shopperListRepository: ShopperListRepository
let shopperListMemberRepository: ShopperListMemberRepository
let sut: GetShopperListAccessService

let owner: User
let member: User
let userNotAccess: User
let shopperList: ShopperList

describe('Get Shopper List Access', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    shopperListRepository = new InMemoryShopperListRepository()
    shopperListMemberRepository = new InMemoryShopperListMemberRepository()
    sut = new GetShopperListAccessService(
      shopperListRepository,
      shopperListMemberRepository
    )

    owner = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      passwordHash: 'hasher-123456'
    })

    member = await userRepository.create({
      name: 'Susan Doe',
      username: 'susandoe',
      email: 'susandoe@example.com',
      passwordHash: 'hasher-123456'
    })

    userNotAccess = await userRepository.create({
      name: 'Warner Doe',
      username: 'warnerdoe',
      email: 'warnerdoe@example.com',
      passwordHash: 'hasher-123456'
    })

    shopperList = await shopperListRepository.create({
      userId: owner.id,
      title: 'ListTest',
      description: 'ListTest Description'
    })
  })

  it('should be able to access shopper list if owner', async () => {
    const result = await sut.execute({
      shopperListId: shopperList.id,
      userId: owner.id
    })

    expect(result).toEqual(shopperList)
  })

  it('should be able to access shopper list if member with accepted invite', async () => {
    const shopperListMember = await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: member.id
    })

    await shopperListMemberRepository.update({
      ...shopperListMember,
      acceptedAt: new Date()
    })

    const result = await sut.execute({
      shopperListId: shopperList.id,
      userId: member.id
    })

    expect(result).toEqual(shopperList)
  })

  it('should not be able to access shopper list if member with pending invite', async () => {
    await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: member.id
    })

    await expect(() =>
      sut.execute({
        shopperListId: shopperList.id,
        userId: member.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to access shopper list if user not member', async () => {
    await expect(() =>
      sut.execute({
        shopperListId: shopperList.id,
        userId: userNotAccess.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to access shopper list if shopper list not found', async () => {
    await expect(() =>
      sut.execute({
        shopperListId: 'shopper-list-not-found',
        userId: owner.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
