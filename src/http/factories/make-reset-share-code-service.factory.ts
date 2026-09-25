import { PrismaShopperListRepository } from '@/repositories/shopper-list-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { ResetShareCodeService } from '@/services/shopper/reset-share-code.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeResetShareCodeService() {
  const userRepository = new PrismaUserRepository()
  const getUserFound = new GetUserFoundService(userRepository)

  const shopperListRepository = new PrismaShopperListRepository()

  return new ResetShareCodeService(getUserFound, shopperListRepository)
}
