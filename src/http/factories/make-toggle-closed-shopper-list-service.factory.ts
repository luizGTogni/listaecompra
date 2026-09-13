import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { ToggleClosedShopperListService } from '@/services/shopper/toggle-closed-shopper-list.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeToggleClosedShopperListService() {
  const getUserFound = new GetUserFoundService(inMemoryUserRepository)

  return new ToggleClosedShopperListService(
    getUserFound,
    inMemoryShopperListRepository
  )
}
