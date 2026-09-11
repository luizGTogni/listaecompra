import { ShopperList } from '@/domain/shopper-list.entity.js'
import { ResourceAlreadyExistsError } from '@/http/types/errors/resource-already-exists.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'

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
    private userRepository: UserRepository,
    private shopperListRepository: ShopperListRepository
  ) {}

  async execute(
    data: CreateShopperListRequest
  ): Promise<CreateShopperListResponse> {
    const owner = await this.userRepository.findById(data.userId)

    if (!owner) {
      throw new ResourceNotFoundError()
    }

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

