import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { InvalidItemQuantityError } from '@/http/types/errors/invalid-item-quantity.error.js'
import { ResourceAlreadyExistsError } from '@/http/types/errors/resource-already-exists.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'

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
    private userRepository: UserRepository,
    private shopperListRepository: ShopperListRepository,
    private shopperItemRepository: ShopperItemRepository
  ) {}

  async execute(
    data: AddItemShopperListRequest
  ): Promise<AddItemShopperListResponse> {
    const user = await this.userRepository.findById(data.userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const shopperList = await this.shopperListRepository.findByIdAndUserId(
      data.shopperListId,
      data.userId
    )

    if (!shopperList) {
      throw new ResourceNotFoundError()
    }

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
