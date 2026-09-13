import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { ShopperList } from '@/domain/shopper-list.entity.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { GetShopperListAccessService } from './get-shopper-list-access.service.js'

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
    private getUserFound: GetUserFoundService,
    private getShopperListAcess: GetShopperListAccessService,
    private shopperListRepository: ShopperListRepository,
    private shopperItemRepository: ShopperItemRepository
  ) {}

  async execute(
    data: FindOneShopperListRequest
  ): Promise<FindOneShopperListResponse> {
    await this.getUserFound.execute({ userId: data.userId })
    const shopperList = await this.getShopperListAcess.execute({
      shopperListId: data.shopperListId,
      userId: data.userId
    })

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
