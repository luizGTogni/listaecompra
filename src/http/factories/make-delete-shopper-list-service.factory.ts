import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { DeleteShopperListService } from '@/services/shopper/delete-shopper-list.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeDeleteShopperListService() {
  const getUserFound = new GetUserFoundService(inMemoryUserRepository)

  return new DeleteShopperListService(
    getUserFound,
    inMemoryShopperListRepository,
    inMemoryShopperListMemberRepository
  )
}
