import {
  ShopperListMember,
  ShopperListMemberInput
} from '@/domain/shopper-list-member.entity.js'
import { ShopperListMemberRepository } from './shopper-list-member.repository.js'

export class InMemoryShopperListMemberRepository implements ShopperListMemberRepository {
  private items: ShopperListMember[] = []

  async create(data: ShopperListMemberInput) {
    const shopperListMember: ShopperListMember = {
      shopperListId: data.shopperListId,
      memberId: data.memberId,
      invitedAt: new Date(),
      acceptedAt: null
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

  async findAllByMemberId(memberId: string, onlyInvite: boolean) {
    if (onlyInvite) {
      return this.items.filter(
        (item) => item.memberId === memberId && item.acceptedAt === null
      )
    }

    return this.items.filter(
      (item) => item.memberId === memberId && item.acceptedAt
    )
  }
}

export const inMemoryShopperListMemberRepository =
  new InMemoryShopperListMemberRepository()
