import { PrismaShopperListMemberRepository } from '@/repositories/shopper-list-member-prisma.repository.js'
import { PrismaShopperListRepository } from '@/repositories/shopper-list-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { CreateShopperListInviteService } from '@/services/shopper-member/create-shopper-list-invite.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeCreateShopperListInviteService() {
  const userRepository = new PrismaUserRepository()
  const getUserFound = new GetUserFoundService(userRepository)

  const shopperListRepository = new PrismaShopperListRepository()
  const shopperListMemberRepository = new PrismaShopperListMemberRepository()

  return new CreateShopperListInviteService(
    getUserFound,
    shopperListRepository,
    shopperListMemberRepository
  )
}
