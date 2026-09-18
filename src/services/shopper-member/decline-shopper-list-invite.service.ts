import { ForbbidenError } from '@/http/types/errors/forbbiden.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListMemberRepository } from '@/repositories/shopper-list-member.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'

interface DeclineShopperListInviteRequest {
  requesterId: string
  shopperListId: string
  memberId: string
}

export class DeclineShopperListInviteService {
  constructor(
    private getUserFound: GetUserFoundService,
    private shopperListRepository: ShopperListRepository,
    private shopperListMemberRepository: ShopperListMemberRepository
  ) {}

  async execute(data: DeclineShopperListInviteRequest): Promise<void> {
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

    await this.shopperListMemberRepository.deleteByShopperListIdAndMemberId(
      shopperList.id,
      member.id
    )
  }
}
