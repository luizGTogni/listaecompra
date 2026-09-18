import { inMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { FindAllShopperListInviteService } from '@/services/shopper-member/find-all-shopper-list-invite.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeFindAllShopperListInviteService() {
  const getUserFound = new GetUserFoundService(inMemoryUserRepository)

  return new FindAllShopperListInviteService(
    getUserFound,
    inMemoryShopperListMemberRepository
  )
}
