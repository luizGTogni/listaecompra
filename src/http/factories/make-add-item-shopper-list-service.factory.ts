import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { AddItemShopperListService } from '@/services/shopper/add-item-shopper-list.service.js'

export function makeAddItemShopperListService() {
  return new AddItemShopperListService(
    inMemoryUserRepository,
    inMemoryShopperListRepository,
    inMemoryShopperItemRepository
  )
}
