import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UpdateShopperItemQuantityService } from '@/services/shopper/update-shopper-item-quantity.service.js'

export function makeUpdateShopperItemQuantityService() {
  return new UpdateShopperItemQuantityService(
    inMemoryUserRepository,
    inMemoryShopperListRepository,
    inMemoryShopperItemRepository
  )
}
