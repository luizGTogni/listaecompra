import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { EventPublisherDriver } from '@/drivers/events/event-publisher.driver.js'
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
  shopperItem: ShopperItem & {
    purchasedBy: { name: string; username: string } | null
  }
}

export class TogglePurchasedShopperItemService {
  constructor(
    private getUserFound: GetUserFoundService,
    private getShopperListAccess: GetShopperListAccessService,
    private shopperItemRepository: ShopperItemRepository,
    private eventPublisher: EventPublisherDriver
  ) {}

  async execute(
    data: TogglePurchasedShopperItemRequest
  ): Promise<TogglePurchasedShopperItemResponse> {
    const user = await this.getUserFound.execute({ userId: data.userId })
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

    shopperItem.purchasedById = shopperItem.purchasedById ? null : data.userId

    const shopperItemUpdated =
      await this.shopperItemRepository.update(shopperItem)

    this.eventPublisher.publish(`list:${shopperList.id}`, {
      type: 'item-purchased-toggled',
      actorId: user.id,
      itemId: shopperItem.id
    })

    return {
      shopperItem: {
        ...shopperItemUpdated,
        purchasedBy: shopperItemUpdated.purchasedById
          ? { name: user.name, username: user.username }
          : null
      }
    }
  }
}
