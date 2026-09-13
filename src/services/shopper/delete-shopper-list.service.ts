import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'

interface DeleteShopperListRequest {
  userId: string
  shopperListId: string
}

export class DeleteShopperListService {
  constructor(
    private getUserFound: GetUserFoundService,
    private shopperListRepository: ShopperListRepository
  ) {}

  async execute(data: DeleteShopperListRequest): Promise<void> {
    await this.getUserFound.execute({ userId: data.userId })
    const shopperList = await this.shopperListRepository.findByIdAndUserId(
      data.shopperListId,
      data.userId
    )

    if (!shopperList) {
      throw new ResourceNotFoundError()
    }

    await this.shopperListRepository.delete(data.shopperListId)
  }
}
