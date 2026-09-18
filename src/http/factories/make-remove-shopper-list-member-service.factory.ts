import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { RemoveShopperListMemberService } from '@/services/shopper-member/remove-shopper-list-member.service.js'
import { GetShopperListAccessService } from '@/services/shopper/get-shopper-list-access.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeRemoveShopperListMemberService() {
  const getUserFound = new GetUserFoundService(inMemoryUserRepository)
  const getShopperListAccess = new GetShopperListAccessService(
    inMemoryShopperListRepository,
    inMemoryShopperListMemberRepository
  )

  return new RemoveShopperListMemberService(
    getUserFound,
    getShopperListAccess,
    inMemoryShopperListMemberRepository
  )
}
