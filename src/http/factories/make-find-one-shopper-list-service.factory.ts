import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { FindOneShopperListService } from '@/services/shopper/find-one-shopper-list.service.js'

export function makeFindOneShopperListService() {
  return new FindOneShopperListService(
    inMemoryUserRepository,
    inMemoryShopperListRepository,
    inMemoryShopperItemRepository
  )
}
