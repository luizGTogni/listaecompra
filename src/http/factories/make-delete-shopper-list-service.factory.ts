import { PrismaShopperListMemberRepository } from '@/repositories/shopper-list-member-prisma.repository.js'
import { PrismaShopperListRepository } from '@/repositories/shopper-list-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { DeleteShopperListService } from '@/services/shopper/delete-shopper-list.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeDeleteShopperListService() {
  const userRepository = new PrismaUserRepository()
  const getUserFound = new GetUserFoundService(userRepository)

  const shopperListRepository = new PrismaShopperListRepository()
  const shopperListMemberRepository = new PrismaShopperListMemberRepository()

  return new DeleteShopperListService(
    getUserFound,
    shopperListRepository,
    shopperListMemberRepository
  )
}
