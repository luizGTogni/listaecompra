import { PrismaShopperItemRepository } from '@/repositories/shopper-item-prisma.repository.js'
import { PrismaShopperListMemberRepository } from '@/repositories/shopper-list-member-prisma.repository.js'
import { PrismaShopperListRepository } from '@/repositories/shopper-list-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { GetShopperListAccessService } from '@/services/shopper/get-shopper-list-access.service.js'
import { RemoveItemShopperListService } from '@/services/shopper/remove-item-shopper-list.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeRemoveItemShopperListService() {
  const userRepository = new PrismaUserRepository()
  const getUserFound = new GetUserFoundService(userRepository)
  const shopperListRepository = new PrismaShopperListRepository()
  const shopperItemRepository = new PrismaShopperItemRepository()
  const shopperListMemberRepository = new PrismaShopperListMemberRepository()
  const getShopperListAccess = new GetShopperListAccessService(
    shopperListRepository,
    shopperListMemberRepository
  )

  return new RemoveItemShopperListService(
    getUserFound,
    getShopperListAccess,
    shopperItemRepository
  )
}
