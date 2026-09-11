import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { FindAllShopperListService } from '@/services/shopper/find-all-shopper-list.service.js'

export function makeFindAllShopperListService() {
  return new FindAllShopperListService(
    inMemoryUserRepository,
    inMemoryShopperListRepository
  )
}
