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
import { DeleteShopperListService } from './delete-shopper-list.service.js'

let userRepository: UserRepository
let getUserFound: GetUserFoundService
let shopperListRepository: ShopperListRepository
let shopperListMemberRepository: ShopperListMemberRepository
let sut: DeleteShopperListService

let user: User
let shopperList: ShopperList

describe('Delete Shopper List', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    getUserFound = new GetUserFoundService(userRepository)
    shopperListRepository = new InMemoryShopperListRepository()
    shopperListMemberRepository = new InMemoryShopperListMemberRepository()
    sut = new DeleteShopperListService(
      getUserFound,
      shopperListRepository,
      shopperListMemberRepository
    )

    user = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      passwordHash: 'hasher-123456'
    })

    shopperList = await shopperListRepository.create({
      userId: user.id,
      title: 'ListTest',
      description: 'ListTest Description'
    })
  })

  it('should be able to delete a shopper list', async () => {
    let shopperListFounded = await shopperListRepository.findByIdAndUserId(
      shopperList.id,
      user.id
    )
    expect(shopperListFounded?.title).toEqual('ListTest')

    await sut.execute({
      userId: user.id,
      shopperListId: shopperList.id
    })

    shopperListFounded = await shopperListRepository.findByIdAndUserId(
      user.id,
      shopperList.id
    )

    expect(shopperListFounded).toBeFalsy()
  })

  it('should not be able to delete a shopper list if user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found',
        shopperListId: shopperList.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a shopper list if shopper list not found', async () => {
    await expect(() =>
      sut.execute({
        userId: user.id,
        shopperListId: 'shopper-list-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a shopper list if user not owner', async () => {
    const user2 = await userRepository.create({
      name: 'John Doe 2',
      username: 'johndoe2',
      email: 'johndoe2@example.com',
      passwordHash: 'hasher-123456'
    })

    await expect(() =>
      sut.execute({
        userId: user2.id,
        shopperListId: shopperList.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a shopper list if member with accepted invite', async () => {
    const member = await userRepository.create({
      name: 'Susan Doe',
      username: 'susandoe',
      email: 'susandoe@example.com',
      passwordHash: 'hasher-123456'
    })

    const shopperListMember = await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: member.id
    })

    await shopperListMemberRepository.update({
      ...shopperListMember,
      acceptedAt: new Date()
    })

    await expect(() =>
      sut.execute({
        userId: member.id,
        shopperListId: shopperList.id
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should remove the shopper list members when the shopper list is deleted', async () => {
    const member = await userRepository.create({
      name: 'Susan Doe',
      username: 'susandoe',
      email: 'susandoe@example.com',
      passwordHash: 'hasher-123456'
    })

    await shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: member.id
    })

    await sut.execute({
      userId: user.id,
      shopperListId: shopperList.id
    })

    const shopperListMembers =
      await shopperListMemberRepository.findAllByShopperListId(shopperList.id)

    expect(shopperListMembers).toHaveLength(0)
  })
})
