import { PrismaShopperListMemberRepository } from '@/repositories/shopper-list-member-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { FindAllShopperListInviteService } from '@/services/shopper-member/find-all-shopper-list-invite.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeFindAllShopperListInviteService() {
  const userRepository = new PrismaUserRepository()
  const getUserFound = new GetUserFoundService(userRepository)

  const shopperListMemberRepository = new PrismaShopperListMemberRepository()

  return new FindAllShopperListInviteService(
    getUserFound,
    shopperListMemberRepository
  )
}
