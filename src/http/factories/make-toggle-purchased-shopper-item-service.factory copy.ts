import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { TogglePurchasedShopperItemService } from '@/services/shopper/toggle-purchased-shopper-item.service.js'

export function makeTogglePurchasedShopperItemService() {
  return new TogglePurchasedShopperItemService(
    inMemoryUserRepository,
    inMemoryShopperListRepository,
    inMemoryShopperItemRepository
  )
}
