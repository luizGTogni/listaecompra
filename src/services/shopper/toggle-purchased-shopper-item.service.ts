import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { GetShopperListAccessService } from './get-shopper-list-access.service.js'

interface TogglePurchasedShopperItemRequest {
  userId: string
  shopperListId: string
  shopperItemId: string
}

interface TogglePurchasedShopperItemResponse {
  shopperItem: ShopperItem
}

export class TogglePurchasedShopperItemService {
  constructor(
    private getUserFound: GetUserFoundService,
    private getShopperListAccess: GetShopperListAccessService,
    private shopperItemRepository: ShopperItemRepository
  ) {}

  async execute(
    data: TogglePurchasedShopperItemRequest
  ): Promise<TogglePurchasedShopperItemResponse> {
    await this.getUserFound.execute({ userId: data.userId })
    const shopperList = await this.getShopperListAccess.execute({
      shopperListId: data.shopperListId,
      userId: data.userId
    })

    if (shopperList.closedAt) {
      throw new ShopperListClosedError()
    }

    const shopperItem =
      await this.shopperItemRepository.findByIdAndShopperListId(
        data.shopperItemId,
        data.shopperListId
      )

    if (!shopperItem) {
      throw new ResourceNotFoundError()
    }

    shopperItem.purchasedAt = shopperItem.purchasedAt ? null : new Date()

    await this.shopperItemRepository.update(shopperItem)

    return { shopperItem }
  }
}
