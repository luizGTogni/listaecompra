import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { InvalidItemQuantityError } from '@/http/types/errors/invalid-item-quantity.error.js'
import { ResourceAlreadyExistsError } from '@/http/types/errors/resource-already-exists.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { GetShopperListAccessService } from './get-shopper-list-access.service.js'

interface AddItemShopperListRequest {
  userId: string
  shopperListId: string
  title: string
  description: string
  quantity: number
}

interface AddItemShopperListResponse {
  shopperItem: ShopperItem
}

export class AddItemShopperListService {
  constructor(
    private getUserFound: GetUserFoundService,
    private getShopperListAccess: GetShopperListAccessService,
    private shopperItemRepository: ShopperItemRepository
  ) {}

  async execute(
    data: AddItemShopperListRequest
  ): Promise<AddItemShopperListResponse> {
    const user = await this.getUserFound.execute({ userId: data.userId })

    const shopperList = await this.getShopperListAccess.execute({
      shopperListId: data.shopperListId,
      userId: user.id
    })

    if (shopperList.closedAt) {
      throw new ShopperListClosedError()
    }

    const shopperItemAlreadyExists =
      await this.shopperItemRepository.findByTitleAndShopperListId(
        data.title,
        data.shopperListId
      )

    if (shopperItemAlreadyExists) {
      throw new ResourceAlreadyExistsError()
    }

    if (data.quantity <= 0) {
      throw new InvalidItemQuantityError()
    }

    const shopperItem = await this.shopperItemRepository.create(data)

    return { shopperItem }
  }
}
