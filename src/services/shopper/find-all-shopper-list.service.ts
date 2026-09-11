import { ShopperList } from '@/domain/shopper-list.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'

interface FindAllShopperListRequest {
  userId: string
  page: number
  query: string
}

interface FindAllShopperListResponse {
  shopperLists: ShopperList[]
}

export class FindAllShopperListService {
  constructor(
    private userRepository: UserRepository,
    private shopperListRepository: ShopperListRepository
  ) {}

  async execute(
    data: FindAllShopperListRequest
  ): Promise<FindAllShopperListResponse> {
    const user = await this.userRepository.findById(data.userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const shopperLists = await this.shopperListRepository.findAllByUserId(
      user.id,
      { page: data.page, query: data.query }
    )

    return {
      shopperLists
    }
  }
}
