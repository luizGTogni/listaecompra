import { ShopperList } from '@/domain/shopper-list.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'

interface ToggleClosedShopperListRequest {
  userId: string
  shopperListId: string
}

interface ToggleClosedShopperListResponse {
  shopperList: ShopperList
}

export class ToggleClosedShopperListService {
  constructor(
    private userRepository: UserRepository,
    private shopperListRepository: ShopperListRepository
  ) {}

  async execute(
    data: ToggleClosedShopperListRequest
  ): Promise<ToggleClosedShopperListResponse> {
    const user = await this.userRepository.findById(data.userId)
    const shopperList = await this.shopperListRepository.findByIdAndUserId(
      data.shopperListId,
      data.userId
    )

    if (!user || !shopperList) {
      throw new ResourceNotFoundError()
    }

    shopperList.closedAt = shopperList.closedAt ? null : new Date()

    await this.shopperListRepository.update(shopperList)

    return { shopperList }
  }
}
