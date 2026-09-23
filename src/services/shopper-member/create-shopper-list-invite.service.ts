import { ShopperListMember } from '@/domain/shopper-list-member.entity.js'
import { ForbbidenError } from '@/http/types/errors/forbbiden.error.js'
import { ResourceAlreadyExistsError } from '@/http/types/errors/resource-already-exists.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { ShopperListMemberRepository } from '@/repositories/shopper-list-member.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { GetUserFoundByUsernameService } from '../users/get-user-found-by-username.service.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'

interface CreateShopperListInviteRequest {
  userId: string
  shopperListId: string
  username: string
}

interface CreateShopperListInviteResponse {
  shopperListMember: ShopperListMember
}

export class CreateShopperListInviteService {
  constructor(
    private getUserFound: GetUserFoundService,
    private getUserFoundByUsername: GetUserFoundByUsernameService,
    private shopperListRepository: ShopperListRepository,
    private shopperListMemberRepository: ShopperListMemberRepository
  ) {}

  async execute(
    data: CreateShopperListInviteRequest
  ): Promise<CreateShopperListInviteResponse> {
    const owner = await this.getUserFound.execute({
      userId: data.userId
    })
    const member = await this.getUserFoundByUsername.execute({
      username: data.username
    })

    if (owner.id === member.id) {
      throw new ForbbidenError()
    }

    const shopperList = await this.shopperListRepository.findById(
      data.shopperListId
    )

    if (!shopperList) {
      throw new ResourceNotFoundError()
    }

    const isOwner = shopperList.userId === owner.id

    if (!isOwner) {
      throw new ForbbidenError()
    }

    if (shopperList.closedAt) {
      throw new ShopperListClosedError()
    }

    const memberAlreadyExists =
      await this.shopperListMemberRepository.findByShopperListIdAndMemberId(
        data.shopperListId,
        member.id
      )

    if (memberAlreadyExists) {
      throw new ResourceAlreadyExistsError()
    }

    const shopperListMember = await this.shopperListMemberRepository.create({
      shopperListId: shopperList.id,
      memberId: member.id
    })

    return { shopperListMember }
  }
}
