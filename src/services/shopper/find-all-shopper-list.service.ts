import {
  ShopperListRepository,
  ShopperListWithUser
} from '@/repositories/shopper-list.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'

interface FindAllShopperListRequest {
  userId: string
  page: number
  limit: number
  query: string
  status?: 'open' | 'closed'
}

interface FindAllShopperListResponse {
  shopperLists: ShopperListWithUser[]
  perPage: number
  page: number
  total: number
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

    const { shopperLists, perPage, page, total } =
      await this.shopperListRepository.findAllByUserId(user.id, {
        page: data.page,
        limit: data.limit,
        query: data.query,
        status: data.status
      })

    return {
      shopperLists,
      perPage,
      page,
      total
    }
  }
}
