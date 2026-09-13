import { ShopperList } from '@/domain/shopper-list.entity.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'

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
    private getUserFound: GetUserFoundService,
    private shopperListRepository: ShopperListRepository
  ) {}

  async execute(
    data: FindAllShopperListRequest
  ): Promise<FindAllShopperListResponse> {
    const user = await this.getUserFound.execute({ userId: data.userId })

    const shopperLists = await this.shopperListRepository.findAllByUserId(
      user.id,
      { page: data.page, query: data.query }
    )

    return {
      shopperLists
    }
  }
}
