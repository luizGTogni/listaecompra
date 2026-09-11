import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'

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
    private userRepository: UserRepository,
    private shopperListRepository: ShopperListRepository,
    private shopperItemRepository: ShopperItemRepository
  ) {}

  async execute(
    data: TogglePurchasedShopperItemRequest
  ): Promise<TogglePurchasedShopperItemResponse> {
    const user = await this.userRepository.findById(data.userId)
    const shopperList = await this.shopperListRepository.findByIdAndUserId(
      data.shopperListId,
      data.userId
    )
    const shopperItem =
      await this.shopperItemRepository.findByIdAndShopperListId(
        data.shopperItemId,
        data.shopperListId
      )

    if (!user || !shopperList || !shopperItem) {
      throw new ResourceNotFoundError()
    }

    if (shopperList.closedAt) {
      throw new ShopperListClosedError()
    }

    shopperItem.purchasedAt = shopperItem.purchasedAt ? null : new Date()

    await this.shopperItemRepository.update(shopperItem)

    return { shopperItem }
  }
}
