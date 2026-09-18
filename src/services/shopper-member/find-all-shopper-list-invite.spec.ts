import { ShopperList } from '@/domain/shopper-list.entity.js'
import { User } from '@/domain/user.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { InMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { InMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { ShopperListMemberRepository } from '@/repositories/shopper-list-member.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { FindAllShopperListInviteService } from './find-all-shopper-list-invite.service.js'

let userRepository: UserRepository
let getUserFound: GetUserFoundService
let shopperListRepository: ShopperListRepository
let shopperListMemberRepository: ShopperListMemberRepository
let sut: FindAllShopperListInviteService

let user1: User
let user2: User
let shopperList1: ShopperList
let shopperList2: ShopperList

describe('Find All Shopper List Invite', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    getUserFound = new GetUserFoundService(userRepository)
    shopperListRepository = new InMemoryShopperListRepository()
    shopperListMemberRepository = new InMemoryShopperListMemberRepository()
    sut = new FindAllShopperListInviteService(
      getUserFound,
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

    shopperList1 = await shopperListRepository.create({
      userId: user1.id,
      title: 'ListTest1',
      description: 'ListTest Description'
    })

    shopperList2 = await shopperListRepository.create({
      userId: user1.id,
      title: 'ListTest2',
      description: 'ListTest Description'
    })
  })

  it('should be able to find all shopper list invite', async () => {
    const shopperListMember1 = await shopperListMemberRepository.create({
      shopperListId: shopperList1.id,
      memberId: user2.id
    })

    const shopperListMember2 = await shopperListMemberRepository.create({
      shopperListId: shopperList2.id,
      memberId: user2.id
    })

    const { shopperListMembers } = await sut.execute({
      userId: user2.id
    })

    expect(shopperListMembers).toHaveLength(2)
    expect(shopperListMembers).toEqual([shopperListMember1, shopperListMember2])
  })

  it('should be able to find all shopper list invite empty', async () => {
    const { shopperListMembers } = await sut.execute({
      userId: user2.id
    })

    expect(shopperListMembers).toHaveLength(0)
    expect(shopperListMembers).toEqual([])
  })

  it('should not be able to find all shopper list invite if user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to find all shopper list invite if invites already accepted', async () => {
    const shopperListMemberCreated1 = await shopperListMemberRepository.create({
      shopperListId: shopperList1.id,
      memberId: user2.id
    })

    const shopperListMemberCreated2 = await shopperListMemberRepository.create({
      shopperListId: shopperList2.id,
      memberId: user2.id
    })

    await shopperListMemberRepository.update({
      ...shopperListMemberCreated1,
      acceptedAt: new Date()
    })

    const { shopperListMembers } = await sut.execute({
      userId: user2.id
    })

    expect(shopperListMembers).toHaveLength(1)
    expect(shopperListMembers).toEqual([shopperListMemberCreated2])
  })
})
