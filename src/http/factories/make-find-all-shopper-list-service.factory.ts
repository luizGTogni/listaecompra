import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { FindAllShopperListService } from '@/services/shopper/find-all-shopper-list.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeFindAllShopperListService() {
  const getUserFound = new GetUserFoundService(inMemoryUserRepository)

  return new FindAllShopperListService(
    getUserFound,
    inMemoryShopperListRepository
  )
}
