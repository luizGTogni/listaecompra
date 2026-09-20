import { PrismaShopperListMemberRepository } from '@/repositories/shopper-list-member-prisma.repository.js'
import { PrismaShopperListRepository } from '@/repositories/shopper-list-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { RemoveShopperListMemberService } from '@/services/shopper-member/remove-shopper-list-member.service.js'
import { GetShopperListAccessService } from '@/services/shopper/get-shopper-list-access.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeRemoveShopperListMemberService() {
  const userRepository = new PrismaUserRepository()
  const getUserFound = new GetUserFoundService(userRepository)
  const shopperListRepository = new PrismaShopperListRepository()
  const shopperListMemberRepository = new PrismaShopperListMemberRepository()
  const getShopperListAccess = new GetShopperListAccessService(
    shopperListRepository,
    shopperListMemberRepository
  )

  return new RemoveShopperListMemberService(
    getUserFound,
    getShopperListAccess,
    shopperListMemberRepository
  )
}
