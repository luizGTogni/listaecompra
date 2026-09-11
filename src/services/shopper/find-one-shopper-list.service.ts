import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { ShopperList } from '@/domain/shopper-list.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'

interface FindOneShopperListRequest {
  userId: string
  shopperListId: string
}

interface FindOneShopperListResponse {
  shopperList: ShopperList & {
    items: ShopperItem[]
  }
}

export class FindOneShopperListService {
  constructor(
    private userRepository: UserRepository,
    private shopperListRepository: ShopperListRepository,
    private shopperItemRepository: ShopperItemRepository
  ) {}

  async execute(
    data: FindOneShopperListRequest
  ): Promise<FindOneShopperListResponse> {
    const user = await this.userRepository.findById(data.userId)
    const shopperList = await this.shopperListRepository.findByIdAndUserId(
      data.shopperListId,
      data.userId
    )

    if (!user || !shopperList) {
      throw new ResourceNotFoundError()
    }

    const items = await this.shopperItemRepository.findAllByShopperListId(
      shopperList.id
    )

    return {
      shopperList: {
        ...shopperList,
        items
      }
    }
  }
}
