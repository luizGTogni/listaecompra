import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListMemberRepository } from '@/repositories/shopper-list-member.repository.js'
import {
  ShopperListRepository,
  ShopperListWithItemsUser
} from '@/repositories/shopper-list.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'

interface FindOneShopperListRequest {
  userId: string
  shopperListId: string
}

interface FindOneShopperListResponse {
  shopperList: ShopperListWithItemsUser
}

export class FindOneShopperListService {
  constructor(
    private getUserFound: GetUserFoundService,
    private shopperListRepository: ShopperListRepository,
    private shopperListMemberRepository: ShopperListMemberRepository
  ) {}

  async execute(
    data: FindOneShopperListRequest
  ): Promise<FindOneShopperListResponse> {
    await this.getUserFound.execute({ userId: data.userId })

    const shopperList =
      await this.shopperListRepository.findWithItemsAndUserById(
        data.shopperListId
      )

    if (!shopperList) {
      throw new ResourceNotFoundError()
    }

    const isOwner = shopperList.userId === data.userId

    if (!isOwner) {
      const membership =
        await this.shopperListMemberRepository.findByShopperListIdAndMemberId(
          data.shopperListId,
          data.userId
        )

      if (!membership || !membership.acceptedAt) {
        throw new ResourceNotFoundError()
      }
    }

    return {
      shopperList
    }
  }
}
