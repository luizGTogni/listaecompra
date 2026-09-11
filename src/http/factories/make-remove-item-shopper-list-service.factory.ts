import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { RemoveItemShopperListService } from '@/services/shopper/remove-item-shopper-list.service.js'

export function makeRemoveItemShopperListService() {
  return new RemoveItemShopperListService(
    inMemoryUserRepository,
    inMemoryShopperListRepository,
    inMemoryShopperItemRepository
  )
}
