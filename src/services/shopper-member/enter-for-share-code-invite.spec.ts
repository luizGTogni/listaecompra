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
import { EnterForShareCodeInviteService } from './enter-for-share-code-invite.service.js'

let userRepository: UserRepository
let getUserFound: GetUserFoundService
let shopperListRepository: ShopperListRepository
let shopperListMemberRepository: ShopperListMemberRepository
let sut: EnterForShareCodeInviteService

let user1: User
let user2: User
let shopperList: ShopperList

describe('Enter For Share Code Invite', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    getUserFound = new GetUserFoundService(userRepository)
    shopperListRepository = new InMemoryShopperListRepository()
    shopperListMemberRepository = new InMemoryShopperListMemberRepository()
    sut = new EnterForShareCodeInviteService(
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

  it('should be able to enter in shopper list for share code', async () => {
    const { shopperListMember } = await sut.execute({
      userId: user2.id,
      shareCode: shopperList.shareCode
    })

    expect(shopperListMember).toEqual({
      shopperListId: shopperList.id,
      memberId: user2.id,
      invitedAt: expect.any(Date),
      acceptedAt: expect.any(Date)
    })
  })

  it('should be able to enter for share code if has a pending invite', async () => {
    await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: user2.id
    })

    const { shopperListMember } = await sut.execute({
      userId: user2.id,
      shareCode: shopperList.shareCode
    })

    const members =
      await shopperListMemberRepository.findByShopperListIdAndMemberId(
        shopperList.id,
        user2.id
      )

    expect(shopperListMember.acceptedAt).toEqual(expect.any(Date))
    expect(shopperListMember).toEqual(members)
  })

  it('should not be able to enter for share code if user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found',
        shareCode: shopperList.shareCode
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to enter for share code if share code not found', async () => {
    await expect(() =>
      sut.execute({
        userId: user2.id,
        shareCode: 'share-code-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to enter for share code if shopper list is closed', async () => {
    await shopperListRepository.update({
      ...shopperList,
      closedAt: new Date()
    })

    await expect(() =>
      sut.execute({
        userId: user2.id,
        shareCode: shopperList.shareCode
      })
    ).rejects.toBeInstanceOf(ShopperListClosedError)
  })

  it('should not be able to enter for share code if user is the owner', async () => {
    await expect(() =>
      sut.execute({
        userId: user1.id,
        shareCode: shopperList.shareCode
      })
    ).rejects.toBeInstanceOf(ForbbidenError)
  })

  it('should not be able to enter for share code if already a member', async () => {
    await sut.execute({
      userId: user2.id,
      shareCode: shopperList.shareCode
    })

    await expect(() =>
      sut.execute({
        userId: user2.id,
        shareCode: shopperList.shareCode
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })

  it('should not be able to enter for share code with old share code after reset', async () => {
    await shopperListRepository.update({
      ...shopperList,
      shareCode: 'new-share-code'
    })

    await expect(() =>
      sut.execute({
        userId: user2.id,
        shareCode: shopperList.shareCode
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
