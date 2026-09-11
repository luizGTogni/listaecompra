import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { DeleteShopperListService } from '@/services/shopper/delete-shopper-list.service.js'

export function makeDeleteShopperListService() {
  return new DeleteShopperListService(
    inMemoryUserRepository,
    inMemoryShopperListRepository
  )
}
