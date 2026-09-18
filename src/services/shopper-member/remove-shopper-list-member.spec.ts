import { ShopperList } from '@/domain/shopper-list.entity.js'
import { User } from '@/domain/user.entity.js'
import { ForbbidenError } from '@/http/types/errors/forbbiden.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { InMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { InMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { ShopperListMemberRepository } from '@/repositories/shopper-list-member.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { GetShopperListAccessService } from '../shopper/get-shopper-list-access.service.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { RemoveShopperListMemberService } from './remove-shopper-list-member.service.js'

let userRepository: UserRepository
let getUserFound: GetUserFoundService
let shopperListRepository: ShopperListRepository
let shopperListMemberRepository: ShopperListMemberRepository
let getShopperListAccess: GetShopperListAccessService
let sut: RemoveShopperListMemberService

let user1: User
let user2: User
let user3: User
let userNotAccess: User
let shopperList: ShopperList

describe('Remove Shopper List Member', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    getUserFound = new GetUserFoundService(userRepository)
    shopperListRepository = new InMemoryShopperListRepository()
    shopperListMemberRepository = new InMemoryShopperListMemberRepository()
    getShopperListAccess = new GetShopperListAccessService(
      shopperListRepository,
      shopperListMemberRepository
    )
    sut = new RemoveShopperListMemberService(
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

    shopperList = await shopperListRepository.create({
      userId: user1.id,
      title: 'ListTest',
      description: 'ListTest Description'
    })

    const shopperListMember2 = await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    const shopperListMember3 = await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: user3.id
    })

    await shopperListMemberRepository.update({
      ...shopperListMember2,
      acceptedAt: new Date()
    })

    await shopperListMemberRepository.update({
      ...shopperListMember3,
      acceptedAt: new Date()
    })
  })

  it('should be able to remove shopper list member', async () => {
    let shopperListMember =
      await shopperListMemberRepository.findByShopperListIdAndMemberId(
        shopperList.id,
        user2.id
      )

    expect(shopperListMember).toBeTruthy()

    await sut.execute({
      requesterId: user1.id,
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    shopperListMember =
      await shopperListMemberRepository.findByShopperListIdAndMemberId(
        shopperList.id,
        user2.id
      )

    expect(shopperListMember).toBeFalsy()
  })

  it('should be able to remove shopper list member if member remove himself', async () => {
    let shopperListMember =
      await shopperListMemberRepository.findByShopperListIdAndMemberId(
        shopperList.id,
        user2.id
      )

    expect(shopperListMember).toBeTruthy()

    await sut.execute({
      requesterId: user2.id,
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    shopperListMember =
      await shopperListMemberRepository.findByShopperListIdAndMemberId(
        shopperList.id,
        user2.id
      )

    expect(shopperListMember).toBeFalsy()
  })

  it('should not be able to remove shopper list member if member', async () => {
    await expect(() =>
      sut.execute({
        requesterId: user3.id,
        shopperListId: shopperList.id,
        memberId: user2.id
      })
    ).rejects.toBeInstanceOf(ForbbidenError)
  })

  it('should not be able to remove shopper list member if user not access', async () => {
    await expect(() =>
      sut.execute({
        requesterId: userNotAccess.id,
        shopperListId: shopperList.id,
        memberId: user2.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to remove shopper list member if invite already not accepted', async () => {
    const userNotAccepted = await userRepository.create({
      name: 'Paik Doe',
      username: 'paikdoe',
      email: 'paikdoe@example.com',
      passwordHash: 'hasher-123456'
    })

    await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: userNotAccepted.id
    })

    await expect(() =>
      sut.execute({
        requesterId: userNotAccepted.id,
        shopperListId: shopperList.id,
        memberId: userNotAccepted.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to remove shopper list member if requester not access', async () => {
    await expect(() =>
      sut.execute({
        requesterId: 'requester-not-found',
        shopperListId: shopperList.id,
        memberId: user2.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to remove shopper list member if shopper list not found', async () => {
    await expect(() =>
      sut.execute({
        requesterId: user1.id,
        shopperListId: 'shopper-list-not-found',
        memberId: user2.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create shopper list invite if member not found', async () => {
    await expect(() =>
      sut.execute({
        requesterId: user1.id,
        shopperListId: shopperList.id,
        memberId: 'member-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create shopper list invite if shopper list member not found', async () => {
    const userNotInvited = await userRepository.create({
      name: 'Doug Doe',
      username: 'dougdoe',
      email: 'dougdoe@example.com',
      passwordHash: 'hasher-123456'
    })

    await expect(() =>
      sut.execute({
        requesterId: user1.id,
        shopperListId: shopperList.id,
        memberId: userNotInvited.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
