import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { DeclineShopperListInviteService } from '@/services/shopper-member/decline-shopper-list-invite.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeDeclineShopperListInviteService() {
  const getUserFound = new GetUserFoundService(inMemoryUserRepository)

  return new DeclineShopperListInviteService(
    getUserFound,
    inMemoryShopperListRepository,
    inMemoryShopperListMemberRepository
  )
}
