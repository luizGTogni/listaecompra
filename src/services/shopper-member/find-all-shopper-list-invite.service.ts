import {
  ShopperListMemberRepository,
  ShopperListMemberWithList
} from '@/repositories/shopper-list-member.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'

interface FindAllShopperListInviteRequest {
  userId: string
}

interface FindAllShopperListInviteResponse {
  shopperListMembers: ShopperListMemberWithList[]
}

export class FindAllShopperListInviteService {
  constructor(
    private getUserFound: GetUserFoundService,
    private shopperListMemberRepository: ShopperListMemberRepository
  ) {}

  async execute(
    data: FindAllShopperListInviteRequest
  ): Promise<FindAllShopperListInviteResponse> {
    await this.getUserFound.execute({
      userId: data.userId
    })

    const shopperListMembers =
      await this.shopperListMemberRepository.findAllByMemberId(
        data.userId,
        true
      )

    return { shopperListMembers }
  }
}
