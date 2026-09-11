import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { ToggleClosedShopperListService } from '@/services/shopper/toggle-closed-shopper-list.service.js'

export function makeToggleClosedShopperListService() {
  return new ToggleClosedShopperListService(
    inMemoryUserRepository,
    inMemoryShopperListRepository
  )
}
