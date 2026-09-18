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
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { AcceptShopperListInviteService } from './accept-shopper-list-invite.service.js'

let userRepository: UserRepository
let getUserFound: GetUserFoundService
let shopperListRepository: ShopperListRepository
let shopperListMemberRepository: ShopperListMemberRepository
let sut: AcceptShopperListInviteService

let user1: User
let user2: User
let shopperList: ShopperList

describe('Accept Shopper List Invite', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    getUserFound = new GetUserFoundService(userRepository)
    shopperListRepository = new InMemoryShopperListRepository()
    shopperListMemberRepository = new InMemoryShopperListMemberRepository()
    sut = new AcceptShopperListInviteService(
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

  it('should be able to accept shopper list invite', async () => {
    await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    const { shopperListMember } = await sut.execute({
      requesterId: user2.id,
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    expect(shopperListMember).toEqual({
      shopperListId: shopperList.id,
      memberId: user2.id,
      invitedAt: expect.any(Date),
      acceptedAt: expect.any(Date)
    })
  })

  it('should not be able to accept shopper list invite when requesterId different memberId', async () => {
    await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    await expect(() =>
      sut.execute({
        requesterId: user1.id,
        shopperListId: shopperList.id,
        memberId: user2.id
      })
    ).rejects.toBeInstanceOf(ForbbidenError)
  })

  it('should not be able to accept shopper list invite if shopper list not found', async () => {
    await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    await expect(() =>
      sut.execute({
        requesterId: user2.id,
        shopperListId: 'shopper-list-not-found',
        memberId: user2.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to accept shopper list invite if shopper list member not found', async () => {
    await expect(() =>
      sut.execute({
        requesterId: user2.id,
        shopperListId: shopperList.id,
        memberId: user2.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to accept shopper list invite if shopper list invite already accepted', async () => {
    await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    await sut.execute({
      requesterId: user2.id,
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    await expect(() =>
      sut.execute({
        requesterId: user2.id,
        shopperListId: shopperList.id,
        memberId: user2.id
      })
    ).rejects.toBeInstanceOf(ForbbidenError)
  })

  it('should not be able to accept shopper list invite if requester not found', async () => {
    await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    await expect(() =>
      sut.execute({
        requesterId: 'requester-not-found',
        shopperListId: shopperList.id,
        memberId: user2.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to accept shopper list invite if member not found', async () => {
    await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    await expect(() =>
      sut.execute({
        requesterId: user2.id,
        shopperListId: shopperList.id,
        memberId: 'member-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
