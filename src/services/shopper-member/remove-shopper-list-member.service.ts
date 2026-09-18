import { ForbbidenError } from '@/http/types/errors/forbbiden.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListMemberRepository } from '@/repositories/shopper-list-member.repository.js'
import { GetShopperListAccessService } from '../shopper/get-shopper-list-access.service.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'

interface RemoveShopperListMemberRequest {
  requesterId: string
  shopperListId: string
  memberId: string
}

export class RemoveShopperListMemberService {
  constructor(
    private getUserFound: GetUserFoundService,
    private getShopperListAccess: GetShopperListAccessService,
    private shopperListMemberRepository: ShopperListMemberRepository
  ) {}

  async execute(data: RemoveShopperListMemberRequest): Promise<void> {
    const requester = await this.getUserFound.execute({
      userId: data.requesterId
    })
    const member = await this.getUserFound.execute({
      userId: data.memberId
    })

    const shopperList = await this.getShopperListAccess.execute({
      shopperListId: data.shopperListId,
      userId: requester.id
    })

    const isOwner = shopperList.userId === requester.id
    const isSelfRemoval = requester.id === member.id

    if (!isOwner && !isSelfRemoval) {
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

    await this.shopperListMemberRepository.deleteByShopperListIdAndMemberId(
      shopperList.id,
      member.id
    )
  }
}
