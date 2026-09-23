import {
  ShopperListMember,
  ShopperListMemberInput
} from '@/domain/shopper-list-member.entity.js'

export type ShopperListMemberWithList = ShopperListMember & {
  shopperList: {
    title: string
    user: {
      name: string
      username: string
    }
  }
}

export interface ShopperListMemberRepository {
  create(data: ShopperListMemberInput): Promise<ShopperListMember>
  update(shopperListMember: ShopperListMember): Promise<ShopperListMember>
  deleteByShopperListIdAndMemberId(
    shopperListId: string,
    memberId: string
  ): Promise<void>
  deleteAll(): Promise<void>
  deleteAllByShopperListId(shopperListId: string): Promise<void>
  findByShopperListIdAndMemberId(
    shopperListId: string,
    memberId: string
  ): Promise<ShopperListMember | null>
  findAllByShopperListId(shopperListId: string): Promise<ShopperListMember[]>
  findAllByMemberId(
    memberId: string,
    onlyInvite: boolean
  ): Promise<ShopperListMemberWithList[]>
}
