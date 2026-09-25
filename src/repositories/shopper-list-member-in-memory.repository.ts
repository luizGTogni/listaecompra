import {
  ShopperListMember,
  ShopperListMemberInput
} from '@/domain/shopper-list-member.entity.js'
import { inMemoryShopperListRepository } from './shopper-list-in-memory.repository.js'
import { ShopperListMemberRepository } from './shopper-list-member.repository.js'
import { ShopperListRepository } from './shopper-list.repository.js'
import { inMemoryUserRepository } from './user-in-memory.repository.js'
import { UserRepository } from './user.repository.js'

export class InMemoryShopperListMemberRepository implements ShopperListMemberRepository {
  private items: ShopperListMember[] = []

  constructor(
    private shopperListRepository: ShopperListRepository = inMemoryShopperListRepository,
    private userRepository: UserRepository = inMemoryUserRepository
  ) {}

  async create(data: ShopperListMemberInput) {
    const shopperListMember: ShopperListMember = {
      shopperListId: data.shopperListId,
      memberId: data.memberId,
      invitedAt: new Date(),
      acceptedAt: data.acceptedAt ? data.acceptedAt : null
    }

    this.items.push(shopperListMember)

    return { ...shopperListMember }
  }

  async update(shopperListMember: ShopperListMember) {
    const shopperListMemberIndex = this.items.findIndex(
      (item) =>
        item.shopperListId === shopperListMember.shopperListId &&
        item.memberId === shopperListMember.memberId
    )

    this.items[shopperListMemberIndex] = shopperListMember

    return { ...shopperListMember }
  }

  async deleteByShopperListIdAndMemberId(
    shopperListId: string,
    memberId: string
  ) {
    const shopperListMembers = this.items.filter(
      (item) =>
        !(item.shopperListId === shopperListId && item.memberId === memberId)
    )

    this.items = shopperListMembers
  }

  async deleteAll() {
    this.items = []
  }

  async deleteAllByShopperListId(shopperListId: string) {
    this.items = this.items.filter(
      (item) => item.shopperListId !== shopperListId
    )
  }

  async findByShopperListIdAndMemberId(
    shopperListId: string,
    memberId: string
  ) {
    const membership = this.items.find(
      (item) =>
        item.shopperListId === shopperListId && item.memberId === memberId
    )

    return membership ? { ...membership } : null
  }

  async findAllByShopperListId(shopperListId: string) {
    return this.items.filter((item) => item.shopperListId === shopperListId)
  }

  async findAllWithUserByShopperListId(shopperListId: string) {
    const shopperListMembers = this.items.filter(
      (item) => item.shopperListId === shopperListId
    )
    const shopperListMembersWithUser = await Promise.all(
      shopperListMembers.map(async (member) => {
        const user = await this.userRepository.findById(member.memberId)

        return {
          ...member,
          user: {
            name: user ? user.name : '',
            username: user ? user.username : ''
          }
        }
      })
    )

    return shopperListMembersWithUser
  }

  async findAllByMemberId(memberId: string, onlyInvite: boolean) {
    const members = this.items.filter((item) =>
      onlyInvite
        ? item.memberId === memberId && item.acceptedAt === null
        : item.memberId === memberId && item.acceptedAt !== null
    )

    const membersWithList = await Promise.all(
      members.map(async (member) => {
        const shopperList = await this.shopperListRepository.findById(
          member.shopperListId
        )

        const user = shopperList
          ? await this.userRepository.findById(shopperList.userId)
          : null

        return {
          ...member,
          shopperList: {
            title: shopperList?.title ?? '',
            user: {
              name: user?.name ?? '',
              username: user?.username ?? ''
            }
          }
        }
      })
    )

    return membersWithList
  }
}

export const inMemoryShopperListMemberRepository =
  new InMemoryShopperListMemberRepository()
