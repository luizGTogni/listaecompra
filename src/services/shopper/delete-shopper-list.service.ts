import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'

interface DeleteShopperListRequest {
  userId: string
  shopperListId: string
}

export class DeleteShopperListService {
  constructor(
    private userRepository: UserRepository,
    private shopperListRepository: ShopperListRepository
  ) {}

  async execute(data: DeleteShopperListRequest): Promise<void> {
    const user = await this.userRepository.findById(data.userId)
    const shopperList = await this.shopperListRepository.findByIdAndUserId(
      data.shopperListId,
      data.userId
    )

    if (!user || !shopperList) {
      throw new ResourceNotFoundError()
    }

    await this.shopperListRepository.delete(data.shopperListId)
  }
}
