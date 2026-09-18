import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { AcceptShopperListInviteService } from '@/services/shopper-member/accept-shopper-list-invite.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeAcceptShopperListInviteService() {
  const getUserFound = new GetUserFoundService(inMemoryUserRepository)

  return new AcceptShopperListInviteService(
    getUserFound,
    inMemoryShopperListRepository,
    inMemoryShopperListMemberRepository
  )
}
