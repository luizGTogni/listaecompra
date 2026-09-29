import { PrismaShopperListMemberRepository } from '@/repositories/shopper-list-member-prisma.repository.js'
import { PrismaShopperListRepository } from '@/repositories/shopper-list-prisma.repository.js'
import { GetShopperListAccessService } from '@/services/shopper/get-shopper-list-access.service.js'

export function makeGetShopperListAccessService() {
  const shopperListRepository = new PrismaShopperListRepository()
  const shopperListMemberRepository = new PrismaShopperListMemberRepository()
  return new GetShopperListAccessService(
    shopperListRepository,
    shopperListMemberRepository
  )
}
