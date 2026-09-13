import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { CreateShopperListService } from '@/services/shopper/create-shopper-list.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeCreateShopperListService() {
  const getUserFound = new GetUserFoundService(inMemoryUserRepository)

  return new CreateShopperListService(
    getUserFound,
    inMemoryShopperListRepository
  )
}
