import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { ShopperList } from '@/domain/shopper-list.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { GetShopperListAccessService } from './get-shopper-list-access.service.js'

interface FindOneShopperItemRequest {
  userId: string
  shopperListId: string
  shopperItemId: string
}

interface FindOneShopperItemResponse {
  shopperItem: ShopperItem & {
    purchasedBy: { name: string; username: string } | null
    shopperList: Omit<ShopperList, 'id' | 'createdAt'>
  }
}

export class FindOneShopperItemService {
  constructor(
    private getUserFound: GetUserFoundService,
    private getShopperListAccess: GetShopperListAccessService,
    private shopperItemRepository: ShopperItemRepository
  ) {}

  async execute(
    data: FindOneShopperItemRequest
  ): Promise<FindOneShopperItemResponse> {
    await this.getUserFound.execute({ userId: data.userId })
    const shopperList = await this.getShopperListAccess.execute({
      shopperListId: data.shopperListId,
      userId: data.userId
    })

    const shopperItem =
      await this.shopperItemRepository.findByIdAndShopperListId(
        data.shopperItemId,
        data.shopperListId
      )

    if (!shopperItem) {
      throw new ResourceNotFoundError()
    }

    const purchasedBy = shopperItem.purchasedById
      ? await this.getUserFound.execute({ userId: shopperItem.purchasedById })
      : null

    return {
      shopperItem: {
        ...shopperItem,
        purchasedBy: purchasedBy
          ? { name: purchasedBy.name, username: purchasedBy.username }
          : null,
        shopperList: {
          userId: shopperList.userId,
          title: shopperList.title,
          description: shopperList.description,
          closedAt: shopperList.closedAt
        }
      }
    }
  }
}
