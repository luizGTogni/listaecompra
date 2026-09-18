import { ShopperList } from '@/domain/shopper-list.entity.js'
import { User } from '@/domain/user.entity.js'
import { ForbbidenError } from '@/http/types/errors/forbbiden.error.js'
import { ResourceAlreadyExistsError } from '@/http/types/errors/resource-already-exists.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { InMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { InMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { ShopperListMemberRepository } from '@/repositories/shopper-list-member.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { CreateShopperListInviteService } from './create-shopper-list-invite.service.js'

let userRepository: UserRepository
let getUserFound: GetUserFoundService
let shopperListRepository: ShopperListRepository
let shopperListMemberRepository: ShopperListMemberRepository
let sut: CreateShopperListInviteService

let user1: User
let user2: User
let shopperList: ShopperList

describe('Create Shopper List Invite', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    getUserFound = new GetUserFoundService(userRepository)
    shopperListRepository = new InMemoryShopperListRepository()
    shopperListMemberRepository = new InMemoryShopperListMemberRepository()
    sut = new CreateShopperListInviteService(
      getUserFound,
      shopperListRepository,
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

    shopperList = await shopperListRepository.create({
      userId: user1.id,
      title: 'ListTest',
      description: 'ListTest Description'
    })
  })

  it('should be able to create shopper list invite', async () => {
    const { shopperListMember } = await sut.execute({
      userId: user1.id,
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    const shopperListMemberFound =
      await shopperListMemberRepository.findByShopperListIdAndMemberId(
        shopperList.id,
        user2.id
      )

    expect(shopperListMember).toEqual({
      shopperListId: shopperList.id,
      memberId: user2.id,
      invitedAt: expect.any(Date),
      acceptedAt: null
    })

    expect(shopperListMemberFound).toEqual(shopperListMember)
  })

  it('should not be able to create shopper list invite if user request same memberId', async () => {
    await expect(() =>
      sut.execute({
        userId: user1.id,
        shopperListId: shopperList.id,
        memberId: user1.id
      })
    ).rejects.toBeInstanceOf(ForbbidenError)
  })

  it('should not be able to create shopper list invite if shopper list not found', async () => {
    await expect(() =>
      sut.execute({
        userId: user1.id,
        shopperListId: 'shopper-list-not-found',
        memberId: user2.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create shopper list invite if requester not owner shopper list', async () => {
    const userNotOwner = await userRepository.create({
      name: 'Warner Doe',
      username: 'warnerdoe',
      email: 'warnerdoe@example.com',
      passwordHash: 'hasher-123456'
    })

    await expect(() =>
      sut.execute({
        userId: userNotOwner.id,
        shopperListId: shopperList.id,
        memberId: user2.id
      })
    ).rejects.toBeInstanceOf(ForbbidenError)
  })

  it('should not be able to create shopper list invite if shopper list closed', async () => {
    await shopperListRepository.update({
      ...shopperList,
      closedAt: new Date()
    })

    await expect(() =>
      sut.execute({
        userId: user1.id,
        shopperListId: shopperList.id,
        memberId: user2.id
      })
    ).rejects.toBeInstanceOf(ShopperListClosedError)
  })

  it('should not be able to create shopper list invite if member already exists in the shopper list member', async () => {
    await sut.execute({
      userId: user1.id,
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    await expect(() =>
      sut.execute({
        userId: user1.id,
        shopperListId: shopperList.id,
        memberId: user2.id
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })

  it('should not be able to create shopper list invite if user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found',
        shopperListId: shopperList.id,
        memberId: user2.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create shopper list invite if member not found', async () => {
    await expect(() =>
      sut.execute({
        userId: user1.id,
        shopperListId: shopperList.id,
        memberId: 'member-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
