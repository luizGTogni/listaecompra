import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { InvalidItemQuantityError } from '@/http/types/errors/invalid-item-quantity.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperItemAlreadyPurchasedError } from '@/http/types/errors/shopper-item-already-purchased.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'

interface UpdateShopperItemQuantityRequest {
  userId: string
  shopperListId: string
  shopperItemId: string
  quantity: number
}

interface UpdateShopperItemQuantityResponse {
  shopperItem: ShopperItem
}

export class UpdateShopperItemQuantityService {
  constructor(
    private userRepository: UserRepository,
    private shopperListRepository: ShopperListRepository,
    private shopperItemRepository: ShopperItemRepository
  ) {}

  async execute(
    data: UpdateShopperItemQuantityRequest
  ): Promise<UpdateShopperItemQuantityResponse> {
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

    if (shopperItem.purchasedAt) {
      throw new ShopperItemAlreadyPurchasedError()
    }

    if (data.quantity < 0) {
      throw new InvalidItemQuantityError()
    }

    if (data.quantity === 0) {
      await this.shopperItemRepository.delete(shopperItem.id)
      return { shopperItem }
    }

    if (data.quantity !== shopperItem.quantity) {
      shopperItem.quantity = data.quantity

      await this.shopperItemRepository.update(shopperItem)
    }

    return { shopperItem }
  }
}
