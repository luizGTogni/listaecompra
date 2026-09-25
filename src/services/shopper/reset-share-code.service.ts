import { ShopperList } from '@/domain/shopper-list.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { randomUUID } from 'node:crypto'
import { GetUserFoundService } from '../users/get-user-found.service.js'

interface ResetShareCodeRequest {
  userId: string
  shopperListId: string
}

interface ResetShareCodeResponse {
  shopperList: ShopperList
}

export class ResetShareCodeService {
  constructor(
    private getUserFound: GetUserFoundService,
    private shopperListRepository: ShopperListRepository
  ) {}

  async execute(data: ResetShareCodeRequest): Promise<ResetShareCodeResponse> {
    await this.getUserFound.execute({ userId: data.userId })

    const shopperList = await this.shopperListRepository.findById(
      data.shopperListId
    )

    if (!shopperList) {
      throw new ResourceNotFoundError()
    }

    const isOwner = shopperList.userId === data.userId

    if (!isOwner) {
      throw new ResourceNotFoundError()
    }

    if (shopperList.closedAt) {
      throw new ShopperListClosedError()
    }

    shopperList.shareCode = randomUUID()

    await this.shopperListRepository.update(shopperList)

    return { shopperList }
  }
}
