import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { AddItemShopperListService } from '@/services/shopper/add-item-shopper-list.service.js'
import { GetShopperListAccessService } from '@/services/shopper/get-shopper-list-access.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeAddItemShopperListService() {
  const getUserFound = new GetUserFoundService(inMemoryUserRepository)
  const getShopperListAccess = new GetShopperListAccessService(
    inMemoryShopperListRepository,
    inMemoryShopperListMemberRepository
  )

  return new AddItemShopperListService(
    getUserFound,
    getShopperListAccess,
    inMemoryShopperItemRepository
  )
}
