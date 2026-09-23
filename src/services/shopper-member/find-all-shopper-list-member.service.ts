import {
  ShopperListMemberRepository,
  ShopperListMemberWithUser
} from '@/repositories/shopper-list-member.repository.js'
import { GetShopperListAccessService } from '../shopper/get-shopper-list-access.service.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'

interface FindAllShopperListMemberRequest {
  shopperListId: string
  userId: string
}

interface FindAllShopperListMemberResponse {
  shopperListMembers: ShopperListMemberWithUser[]
}

export class FindAllShopperListMemberService {
  constructor(
    private getUserFound: GetUserFoundService,
    private getShopperListAccess: GetShopperListAccessService,
    private shopperListMemberRepository: ShopperListMemberRepository
  ) {}

  async execute(
    data: FindAllShopperListMemberRequest
  ): Promise<FindAllShopperListMemberResponse> {
    await this.getUserFound.execute({
      userId: data.userId
    })

    const shopperList = await this.getShopperListAccess.execute({
      shopperListId: data.shopperListId,
      userId: data.userId
    })

    const shopperListMembers =
      await this.shopperListMemberRepository.findAllWithUserByShopperListId(
        shopperList.id
      )

    return { shopperListMembers }
  }
}
