import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { CreateShopperListService } from '@/services/shopper/create-shopper-list.service.js'

export function makeCreateShopperListService() {
  return new CreateShopperListService(
    inMemoryUserRepository,
    inMemoryShopperListRepository
  )
}
