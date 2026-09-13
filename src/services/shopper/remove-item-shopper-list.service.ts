import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { GetShopperListAccessService } from './get-shopper-list-access.service.js'

interface RemoveItemShopperListRequest {
  shopperItemId: string
  shopperListId: string
  userId: string
}

export class RemoveItemShopperListService {
  constructor(
    private getUserFound: GetUserFoundService,
    private getShopperListAccess: GetShopperListAccessService,
    private shopperItemRepository: ShopperItemRepository
  ) {}

  async execute(data: RemoveItemShopperListRequest): Promise<void> {
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

    await this.shopperItemRepository.delete(data.shopperItemId)
  }
}
