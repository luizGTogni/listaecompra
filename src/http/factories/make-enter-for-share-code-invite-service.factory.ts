import { PrismaShopperListMemberRepository } from '@/repositories/shopper-list-member-prisma.repository.js'
import { PrismaShopperListRepository } from '@/repositories/shopper-list-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { EnterForShareCodeInviteService } from '@/services/shopper-member/enter-for-share-code-invite.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeEnterForShareCodeInviteService() {
  const userRepository = new PrismaUserRepository()
  const getUserFound = new GetUserFoundService(userRepository)

  const shopperListRepository = new PrismaShopperListRepository()
  const shopperListMemberRepository = new PrismaShopperListMemberRepository()

  return new EnterForShareCodeInviteService(
    getUserFound,
    shopperListRepository,
    shopperListMemberRepository
  )
}
