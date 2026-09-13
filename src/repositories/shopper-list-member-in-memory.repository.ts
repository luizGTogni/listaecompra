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

  async deleteAll() {
    this.items = []
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
}

export const inMemoryShopperListMemberRepository =
  new InMemoryShopperListMemberRepository()
