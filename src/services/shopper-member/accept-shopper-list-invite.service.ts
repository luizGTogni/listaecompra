import { ShopperListMember } from '@/domain/shopper-list-member.entity.js'
import { ForbbidenError } from '@/http/types/errors/forbbiden.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListMemberRepository } from '@/repositories/shopper-list-member.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'

interface AcceptShopperListInviteRequest {
  requesterId: string
  shopperListId: string
  memberId: string
}

interface AcceptShopperListInviteResponse {
  shopperListMember: ShopperListMember
}

export class AcceptShopperListInviteService {
  constructor(
    private getUserFound: GetUserFoundService,
    private shopperListRepository: ShopperListRepository,
    private shopperListMemberRepository: ShopperListMemberRepository
  ) {}

  async execute(
    data: AcceptShopperListInviteRequest
  ): Promise<AcceptShopperListInviteResponse> {
    const requester = await this.getUserFound.execute({
      userId: data.requesterId
    })
    const member = await this.getUserFound.execute({
      userId: data.memberId
    })

    const shopperList = await this.shopperListRepository.findById(
      data.shopperListId
    )

    if (!shopperList) {
      throw new ResourceNotFoundError()
    }

    const isSelfRemoval = requester.id === member.id

    if (!isSelfRemoval) {
      throw new ForbbidenError()
    }

    const shopperListMember =
      await this.shopperListMemberRepository.findByShopperListIdAndMemberId(
        shopperList.id,
        member.id
      )

    if (!shopperListMember) {
      throw new ResourceNotFoundError()
    }

    if (shopperListMember.acceptedAt) {
      throw new ForbbidenError()
    }

    shopperListMember.acceptedAt = new Date()

    await this.shopperListMemberRepository.update(shopperListMember)

    return { shopperListMember }
  }
}
