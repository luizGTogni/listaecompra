import { ShopperListMember } from '@/domain/shopper-list-member.entity.js'
import { ForbbidenError } from '@/http/types/errors/forbbiden.error.js'
import { ResourceAlreadyExistsError } from '@/http/types/errors/resource-already-exists.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { ShopperListMemberRepository } from '@/repositories/shopper-list-member.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'

interface EnterForShareCodeInviteRequest {
  userId: string
  shareCode: string
}

interface EnterForShareCodeInviteResponse {
  shopperListMember: ShopperListMember
}

export class EnterForShareCodeInviteService {
  constructor(
    private getUserFound: GetUserFoundService,
    private shopperListRepository: ShopperListRepository,
    private shopperListMemberRepository: ShopperListMemberRepository
  ) {}

  async execute(
    data: EnterForShareCodeInviteRequest
  ): Promise<EnterForShareCodeInviteResponse> {
    const user = await this.getUserFound.execute({
      userId: data.userId
    })

    const shopperList = await this.shopperListRepository.findByShareCode(
      data.shareCode
    )

    if (!shopperList) {
      throw new ResourceNotFoundError()
    }

    if (shopperList.closedAt) {
      throw new ShopperListClosedError()
    }

    if (shopperList.userId === user.id) {
      throw new ForbbidenError()
    }

    const shopperListMemberExists =
      await this.shopperListMemberRepository.findByShopperListIdAndMemberId(
        shopperList.id,
        user.id
      )

    if (shopperListMemberExists && shopperListMemberExists.acceptedAt) {
      throw new ResourceAlreadyExistsError()
    }

    if (shopperListMemberExists) {
      shopperListMemberExists.acceptedAt = new Date()

      const shopperListMember = await this.shopperListMemberRepository.update(
        shopperListMemberExists
      )

      return { shopperListMember }
    }

    const shopperListMember = await this.shopperListMemberRepository.create({
      memberId: user.id,
      shopperListId: shopperList.id,
      acceptedAt: new Date()
    })

    return { shopperListMember }
  }
}
