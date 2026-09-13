import { ShopperList } from '@/domain/shopper-list.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'

interface ToggleClosedShopperListRequest {
  userId: string
  shopperListId: string
}

interface ToggleClosedShopperListResponse {
  shopperList: ShopperList
}

export class ToggleClosedShopperListService {
  constructor(
    private getUserFound: GetUserFoundService,
    private shopperListRepository: ShopperListRepository
  ) {}

  async execute(
    data: ToggleClosedShopperListRequest
  ): Promise<ToggleClosedShopperListResponse> {
    await this.getUserFound.execute({ userId: data.userId })
    const shopperList = await this.shopperListRepository.findByIdAndUserId(
      data.shopperListId,
      data.userId
    )

    if (!shopperList) {
      throw new ResourceNotFoundError()
    }

    shopperList.closedAt = shopperList.closedAt ? null : new Date()

    await this.shopperListRepository.update(shopperList)

    return { shopperList }
  }
}
