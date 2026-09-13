import { ShopperList } from '@/domain/shopper-list.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListMemberRepository } from '@/repositories/shopper-list-member.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'

interface GetShopperListAccessRequest {
  shopperListId: string
  userId: string
}

export class GetShopperListAccessService {
  constructor(
    private shopperListRepository: ShopperListRepository,
    private shopperListMemberRepository: ShopperListMemberRepository
  ) {}

  async execute(data: GetShopperListAccessRequest): Promise<ShopperList> {
    const shopperList = await this.shopperListRepository.findById(
      data.shopperListId
    )

    if (!shopperList) {
      throw new ResourceNotFoundError()
    }

    const isOwner = shopperList.userId === data.userId

    if (isOwner) {
      return shopperList
    }

    const membership =
      await this.shopperListMemberRepository.findByShopperListIdAndMemberId(
        data.shopperListId,
        data.userId
      )

    if (!membership) {
      throw new ResourceNotFoundError()
    }

    if (!membership.acceptedAt) {
      throw new ResourceNotFoundError()
    }

    return shopperList
  }
}
