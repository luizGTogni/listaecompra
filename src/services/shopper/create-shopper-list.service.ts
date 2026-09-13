import { ShopperList } from '@/domain/shopper-list.entity.js'
import { ResourceAlreadyExistsError } from '@/http/types/errors/resource-already-exists.error.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'

interface CreateShopperListRequest {
  userId: string
  title: string
  description: string
}

interface CreateShopperListResponse {
  shopperList: ShopperList
}

export class CreateShopperListService {
  constructor(
    private getUserFound: GetUserFoundService,
    private shopperListRepository: ShopperListRepository
  ) {}

  async execute(
    data: CreateShopperListRequest
  ): Promise<CreateShopperListResponse> {
    await this.getUserFound.execute({ userId: data.userId })

    const shopperListAlreadyExists =
      await this.shopperListRepository.findByTitleAndUserId(
        data.title,
        data.userId
      )

    if (shopperListAlreadyExists) {
      throw new ResourceAlreadyExistsError()
    }

    const shopperList = await this.shopperListRepository.create({
      title: data.title,
      description: data.description,
      userId: data.userId
    })

    return { shopperList }
  }
}
