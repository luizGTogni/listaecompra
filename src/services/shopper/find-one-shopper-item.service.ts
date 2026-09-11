import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { ShopperList } from '@/domain/shopper-list.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'

interface FindOneShopperItemRequest {
  userId: string
  shopperListId: string
  shopperItemId: string
}

interface FindOneShopperItemResponse {
  shopperItem: ShopperItem & {
    shopperList: Omit<ShopperList, 'id' | 'createdAt'>
  }
}

export class FindOneShopperItemService {
  constructor(
    private userRepository: UserRepository,
    private shopperListRepository: ShopperListRepository,
    private shopperItemRepository: ShopperItemRepository
  ) {}

  async execute(
    data: FindOneShopperItemRequest
  ): Promise<FindOneShopperItemResponse> {
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

    return {
      shopperItem: {
        ...shopperItem,
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
