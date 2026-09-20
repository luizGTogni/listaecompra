import { PrismaShopperListMemberRepository } from '@/repositories/shopper-list-member-prisma.repository.js'
import { PrismaShopperListRepository } from '@/repositories/shopper-list-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { AcceptShopperListInviteService } from '@/services/shopper-member/accept-shopper-list-invite.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeAcceptShopperListInviteService() {
  const userRepository = new PrismaUserRepository()

  const getUserFound = new GetUserFoundService(userRepository)

  const shopperListRepository = new PrismaShopperListRepository()
  const shopperListMemberRepository = new PrismaShopperListMemberRepository()

  return new AcceptShopperListInviteService(
    getUserFound,
    shopperListRepository,
    shopperListMemberRepository
  )
}
