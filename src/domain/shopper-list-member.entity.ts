export interface ShopperListMember {
  shopperListId: string
  memberId: string
  invitedAt: Date
  acceptedAt: Date | null
}

export interface ShopperListMemberInput {
  shopperListId: string
  memberId: string
  acceptedAt?: Date
}
