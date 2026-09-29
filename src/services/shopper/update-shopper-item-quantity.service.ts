import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { EventPublisherDriver } from '@/drivers/events/event-publisher.driver.js'
import { InvalidItemQuantityError } from '@/http/types/errors/invalid-item-quantity.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperItemAlreadyPurchasedError } from '@/http/types/errors/shopper-item-already-purchased.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { GetShopperListAccessService } from './get-shopper-list-access.service.js'

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
    private getUserFound: GetUserFoundService,
    private getShopperListAccess: GetShopperListAccessService,
    private shopperItemRepository: ShopperItemRepository,
    private eventPublisher: EventPublisherDriver
  ) {}

  async execute(
    data: UpdateShopperItemQuantityRequest
  ): Promise<UpdateShopperItemQuantityResponse> {
    if (data.quantity < 0) {
      throw new InvalidItemQuantityError()
    }

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

    if (shopperItem.purchasedAt) {
      throw new ShopperItemAlreadyPurchasedError()
    }

    if (data.quantity === 0) {
      await this.shopperItemRepository.delete(shopperItem.id)

      this.eventPublisher.publish(`list:${shopperList.id}`, {
        type: 'item-removed',
        actorId: data.userId,
        itemId: data.shopperItemId
      })

      return { shopperItem }
    }

    if (data.quantity !== shopperItem.quantity) {
      shopperItem.quantity = data.quantity

      await this.shopperItemRepository.update(shopperItem)

      this.eventPublisher.publish(`list:${shopperList.id}`, {
        type: 'item-quantity-updated',
        actorId: data.userId,
        itemId: data.shopperItemId
      })
    }

    return { shopperItem }
  }
}
