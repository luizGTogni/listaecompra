import {
  ShopperListMember,
  ShopperListMemberInput
} from '@/domain/shopper-list-member.entity.js'

export interface ShopperListMemberRepository {
  create(data: ShopperListMemberInput): Promise<ShopperListMember>
  deleteAll(): Promise<void>
  findByShopperListIdAndMemberId(
    shopperListId: string,
    memberId: string
  ): Promise<ShopperListMember | null>
}
